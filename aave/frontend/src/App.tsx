import { OpenfortButton, useStatus } from "@openfort/react";
import { useAccount } from "wagmi";
import { useState, useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { formatUsdcBalance } from './lib/utils';
import { usdcAbi, USDC_CONTRACT_ADDRESS } from './contracts/usdc';
import { errAsync, useSupply, evmAddress, bigDecimal, useAaveMarkets, chainId, PageSize, useUserSupplies, useWithdraw } from "@aave/react";
import { useSendTransaction } from "@aave/react/viem";
import { useWalletClient } from "wagmi";

function App() {
  const { chainId: currentChainId } = useAccount();
  const { isConnected } = useStatus();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const [supply, supplying] = useSupply();
  const [withdraw, withdrawing] = useWithdraw();
  const [sendTransaction, sending] = useSendTransaction(walletClient);
  const [isSupplying, setIsSupplying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Read USDC balance
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: usdcAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Fetch all Aave markets
  const {
    data: markets,
    loading: marketsLoading,
    error: marketsError,
  } = useAaveMarkets({
    chainIds: currentChainId ? [chainId(currentChainId)] : [],
    user: address ? evmAddress(address) : undefined,
  });

  // Get user's Aave supplies
  const { data: userSupplies, loading: suppliesLoading, error: suppliesError } = useUserSupplies({
    markets:
      markets?.map((market) => ({
        chainId: market.chain.chainId,
        address: market.address,
      })) || [],
    user: address
      ? evmAddress(address)
      : undefined,
  });

  // Find USDC supply balance and APY
  const usdcSupplyData = useMemo(() => {
    if (!userSupplies || userSupplies.length === 0) {
      return { balance: "0.00", apy: "0.00" };
    }
    
    // Look for USDC supply position
    const usdcSupply = userSupplies.find((supply: any) => 
      supply.currency?.symbol === 'USDC'
    );
    
    if (usdcSupply?.balance?.amount?.value && usdcSupply?.apy?.formatted) {
      return {
        balance: parseFloat(usdcSupply.balance.amount.value).toFixed(2),
        apy: usdcSupply.apy.formatted
      };
    }
    
    return { balance: "0.00", apy: "0.00" };
  }, [userSupplies]);

  console.log("User supplies:", userSupplies);
  console.log("USDC supply data:", usdcSupplyData);

  const usdcReserve = useMemo(() => {
    if (!markets || markets.length === 0) return null;
    const market = markets[0];
    const usdcSupplyReserve = market.supplyReserves.find(reserve => 
      reserve.underlyingToken.symbol === 'USDC'
    );
    if (usdcSupplyReserve) {
      return {
        marketAddress: market.address,
        currencyAddress: usdcSupplyReserve.underlyingToken.address,
        chainId: market.chain.chainId
      };
    }
    return null;
  }, [markets]);

  console.log("Available Aave markets:", markets);
  console.log("Found USDC reserve:", usdcReserve);


  // Deposit to Aave vault
  const handleDepositToAave = async () => {
    if (!walletClient || !address || !usdcReserve) {
      console.error("Missing requirements:", { walletClient: !!walletClient, address: !!address, usdcReserve: !!usdcReserve });
      return;
    }

    setIsSupplying(true);

    try {
      const supplyResult = await supply({
        market: evmAddress(usdcReserve.marketAddress),
        amount: {
          erc20: {
            currency: evmAddress(usdcReserve.currencyAddress),
            value: bigDecimal(1), // 1 USDC
          },
        },
        sender: evmAddress(walletClient.account.address),
        chainId: usdcReserve.chainId,
      });

      if (supplyResult.isErr()) {
        console.error("Supply preparation failed:", supplyResult.error);
        setIsSupplying(false);
        return;
      }
      const plan = supplyResult.value;
      let transactionResult;
      switch (plan.__typename) {
        case "TransactionRequest":
          transactionResult = await sendTransaction(plan);
          break;
        case "ApprovalRequired":
          const approvalResult = await sendTransaction(plan.approval);
          if (approvalResult.isErr()) {
            console.error("Approval failed:", approvalResult.error);
            setIsSupplying(false);
            return;
          }
          transactionResult = await sendTransaction(plan.originalTransaction);
          break;
        case "InsufficientBalanceError":
          setIsSupplying(false);
          return;
        default:
          console.error("Unknown plan type:", plan);
          setIsSupplying(false);
          return;
      }

      if (transactionResult.isErr()) {
        console.error("Transaction failed:", transactionResult.error);
      } else {
        console.log("Supply successful with hash:", transactionResult.value);
        // Refetch balances after successful transaction
        setTimeout(() => {
          refetchUsdcBalance();
          // Force a page refresh to update Aave supplies since there's no refetch available
          window.location.reload();
        }, 2000); // Wait 2 seconds for blockchain to update
      }
    } catch (error) {
      console.error("Aave deposit failed:", error);
    } finally {
      setIsSupplying(false);
    }
  };

  // Withdraw from Aave pool
  const handleWithdrawFromAave = async () => {
    if (!walletClient || !address || !usdcReserve) {
      console.error("Missing requirements:", { walletClient: !!walletClient, address: !!address, usdcReserve: !!usdcReserve });
      return;
    }

    // Check if user has any USDC supply to withdraw
    if (!usdcSupplyData.balance || parseFloat(usdcSupplyData.balance) === 0) {
      console.error("No USDC supply to withdraw");
      return;
    }

    setIsWithdrawing(true);

    try {
      console.log("Withdrawing USDC from Aave...");
      console.log("Using market:", usdcReserve.marketAddress);
      console.log("Using USDC currency:", usdcReserve.currencyAddress);
      console.log("Withdrawing amount:", usdcSupplyData.balance);
      
      const withdrawResult = await withdraw({
        market: evmAddress(usdcReserve.marketAddress),
        amount: {
          erc20: {
            currency: evmAddress(usdcReserve.currencyAddress),
            value: { max: true }, // Withdraw full balance
          },
        },
        sender: evmAddress(walletClient.account.address),
        chainId: usdcReserve.chainId,
      });

      if (withdrawResult.isErr()) {
        console.error("Withdraw preparation failed:", withdrawResult.error);
        setIsWithdrawing(false);
        return;
      }

      const plan = withdrawResult.value;
      console.log("Withdraw plan:", plan);

      let transactionResult;

      switch (plan.__typename) {
        case "TransactionRequest":
          console.log("Executing withdraw transaction");
          transactionResult = await sendTransaction(plan);
          break;
          
        case "InsufficientBalanceError":
          console.error(`Insufficient balance: ${plan.required.value} required.`);
          setIsWithdrawing(false);
          return;
          
        default:
          console.error("Unknown plan type:", plan);
          setIsWithdrawing(false);
          return;
      }

      if (transactionResult.isErr()) {
        console.error("Withdraw transaction failed:", transactionResult.error);
      } else {
        console.log("Withdraw successful with hash:", transactionResult.value);
        // Refetch balances after successful transaction
        setTimeout(() => {
          refetchUsdcBalance();
          // Force a page refresh to update Aave supplies since there's no refetch available
          window.location.reload();
        }, 2000); // Wait 2 seconds for blockchain to update
      }
    } catch (error) {
      console.error("Aave withdraw failed:", error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const isLoading = supplying.loading || sending.loading || isSupplying || withdrawing.loading || isWithdrawing;

  return (
    <div className="min-h-screen bg-black/95 flex items-center justify-center p-4 font-figtree">
      <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-tight">
          Openfort Wallet <br /> + Aave
        </h1>

        {/* Balance Cards Container */}
        <div className="flex flex-col md:flex-row gap-6 mb-6 justify-center items-center">
          {/* USDC Wallet Balance Card */}
          <div className="bg-black/95 rounded-2xl p-8 border border-neutral-700 shadow-xl w-80 h-64 flex items-center justify-center">
            <div className="text-center">
              {isConnected && address ? (
                <div className="space-y-3">
                  <div className="text-xs text-neutral-400 uppercase tracking-wider">
                    Wallet Balance
                  </div>
                  <div className="text-4xl font-bold text-white">
                    {formatUsdcBalance(usdcBalance as bigint | undefined)}
                  </div>
                  <div className="text-sm text-neutral-300">
                    USDC
                  </div>
                </div>
              ) : (
                <div className="text-neutral-500 text-sm">
                  Connect wallet to view balance
                </div>
              )}
            </div>
          </div>

          {/* Aave Supply Balance Card */}
          <div className="bg-black/95 rounded-2xl p-8 border border-neutral-700 shadow-xl w-80 h-64 flex items-center justify-center">
          <div className="text-center">
              {isConnected && address ? (
                <div className="space-y-3">
                  <div className="text-xs text-neutral-400 uppercase tracking-wider">
                    Aave Supply
                  </div>
                  <div className="text-4xl font-bold text-white">
                    {suppliesLoading ? (
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : (
                      usdcSupplyData.balance
                    )}
                  </div>
                  <div className="text-sm text-neutral-300">
                    USDC
                  </div>
                  {!suppliesLoading && usdcSupplyData.apy !== "0.00" && (
                    <div className="text-sm text-green-400 font-semibold">
                      🌱 {usdcSupplyData.apy}% APY
                    </div>
                  )}
                  {suppliesError && (
                    <div className="text-xs text-red-400">
                      Failed to load
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-neutral-500 text-sm">
                  Connect wallet to view balance
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-700 shadow-xl p-8 mb-6 flex flex-col items-center justify-center space-y-4 ">

          <OpenfortButton
            showBalance={false}
            showAvatar={true}
            label="Connect Wallet"
          />

          {isConnected && (
            <div className="w-80 space-y-4">
              <button 
                onClick={handleDepositToAave}
                disabled={isLoading || !usdcReserve || !usdcBalance || usdcBalance === 0n}
                className="w-full bg-white text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg border border-gray-200 flex flex-row items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isSupplying || supplying.loading) && !isWithdrawing && !withdrawing.loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>
                      {isSupplying ? 'Supplying...' : 
                       supplying.loading ? 'Preparing...' : 
                       'Sending Transaction...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">️↗️</span>
                    Supply to pool
                  </>
                )}
              </button>

              <button 
                onClick={handleWithdrawFromAave}
                disabled={isLoading || !usdcReserve || parseFloat(usdcSupplyData.balance) === 0}
                className="w-full bg-white text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg border border-gray-200 flex flex-row items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isWithdrawing || withdrawing.loading) && !isSupplying && !supplying.loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>
                      {isWithdrawing ? 'Withdrawing...' : 
                       withdrawing.loading ? 'Preparing...' : 
                       'Sending Transaction...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">️↙️</span>
                    Withdraw from pool
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
