import { useEffect, useState } from 'react';
import { OpenfortButton, useStatus } from "@openfort/react";
import { useAccount, useReadContract, useWalletClient } from 'wagmi';
import { USDC_CONTRACT_ADDRESS, usdcAbi } from './contracts/usdc';
import { formatUsdcBalance } from './lib/utils';
import { GraphQLClient, gql } from "graphql-request";
import { createPublicClient, http, parseAbi, type Address } from 'viem';
import { base } from 'viem/chains';

const MORPHO_API = "https://blue-api.morpho.org/graphql";
const VAULT_ADDRESS = "0xbeeF010f9cb27031ad51e3333f9aF9C6B1228183";
const MINIMAL_VAULT_ABI = parseAbi([
  "function balanceOf(address account) external view returns (uint256)",
  "function convertToAssets(uint256 shares) external view returns (uint256)",
  "function deposit(uint256 assets, address receiver) external returns (uint256)",
  "function redeem(uint256 shares, address receiver, address owner) external returns (uint256)",
]);

function App() {
  const [isSupplying, setIsSupplying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [vaultApy, setVaultApy] = useState<string>("0.00");
  const [userVaultBalance, setUserVaultBalance] = useState<bigint>(0n);
  
  const { isConnected } = useStatus();
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();

  const isLoading = isSupplying || isWithdrawing;

  const viemClient = createPublicClient({
    chain: base,
    transport: http("https://mainnet.base.org", {
      retryCount: 3,
      retryDelay: 1000,
      batch: { batchSize: 50, wait: 500 },
    }),
    batch: { multicall: { batchSize: 1024, wait: 200 } },
  });

  const { data: walletBalance, refetch: refetchWalletBalance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: usdcAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const fetchVaultBalance = async () => {
    if (!address || !viemClient) return;
    try {
      const userShares = await viemClient.readContract({
        address: VAULT_ADDRESS as Address,
        abi: MINIMAL_VAULT_ABI,
        functionName: 'balanceOf',
        args: [address as Address],
      });

      const userAssets = await viemClient.readContract({
        address: VAULT_ADDRESS as Address,
        abi: MINIMAL_VAULT_ABI,
        functionName: 'convertToAssets',
        args: [userShares],
      });
      
      setUserVaultBalance(userAssets);
    } catch (error) {
      console.error("Error fetching vault balance:", error);
    }
  };

  useEffect(() => {
    if (address && viemClient) {
      fetchVaultBalance();
    }
  }, [address, viemClient]);

  useEffect(() => {
    const fetchVaultApy = async () => {
      if (!chainId) return;
      
      const GET_VAULT_APY = gql`
        query VaultApy($vaultAddress: String!, $chainId: Int!) {
          vaultByAddress(address: $vaultAddress, chainId: $chainId) {
            state { netApy }
          }
        }
      `;
      
      try {
        const client = new GraphQLClient(MORPHO_API);
        const data = await client.request(GET_VAULT_APY, {
          vaultAddress: VAULT_ADDRESS,
          chainId: chainId,
        }) as any;
        
        const netApy = data?.vaultByAddress?.state?.netApy;
        if (netApy) {
          setVaultApy((Number(netApy) * 100).toFixed(2));
        }
      } catch (err) {
        console.error("Error fetching vault APY:", err);
      }
    };
    
    fetchVaultApy();
  }, [address, chainId]);

  const handleSupply = async () => {
    if (!walletClient || !address || !walletBalance || walletBalance === 0n) return;

    setIsSupplying(true);
    try {
      // Approve USDC spending
      await walletClient.writeContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: usdcAbi,
        functionName: 'approve',
        args: [VAULT_ADDRESS as `0x${string}`, walletBalance],
      });
      
      // Wait for approval
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Deposit to vault
      await walletClient.writeContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: MINIMAL_VAULT_ABI,
        functionName: 'deposit',
        args: [walletBalance, address as `0x${string}`],
      });

      // Refresh balances
      setTimeout(() => {
        refetchWalletBalance();
        fetchVaultBalance();
      }, 5000);

    } catch (error: any) {
      alert(`Deposit failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSupplying(false);
    }
  };

  const handleWithdraw = async () => {
    if (!walletClient || !address || !userVaultBalance || userVaultBalance === 0n) return;

    setIsWithdrawing(true);
    try {
      // Get user's vault shares
      const userShares = await viemClient.readContract({
        address: VAULT_ADDRESS as Address,
        abi: MINIMAL_VAULT_ABI,
        functionName: 'balanceOf',
        args: [address as Address],
      });

      if (userShares === 0n) {
        alert("No vault balance to withdraw");
        setIsWithdrawing(false);
        return;
      }

      // Redeem all shares
      await walletClient.writeContract({
        address: VAULT_ADDRESS as Address,
        abi: MINIMAL_VAULT_ABI,
        functionName: 'redeem',
        args: [userShares, address as Address, address as Address],
        gas: 500000n,
      });

      // Refresh balances
      setTimeout(() => {
        refetchWalletBalance();
        fetchVaultBalance();
      }, 5000);

    } catch (error: any) {
      if (error?.message?.includes('rate limit') || error?.message?.includes('overrate')) {
        alert("Rate limit exceeded. Please wait a moment and try again.");
      } else if (error?.message?.includes('insufficient funds') || error?.message?.includes('gas')) {
        alert("Insufficient gas or funds for withdrawal transaction.");
      } else if (error?.message?.includes('user rejected')) {
        alert("Transaction was cancelled.");
      } else {
        alert(`Withdraw failed: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/95 flex items-center justify-center p-4 font-figtree">
      <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-tight">
          Openfort Wallet <br /> + Morpho
        </h1>

        {/* Balance Cards Container */}
        <div className="flex flex-col md:flex-row gap-6 mb-6 justify-center items-center">
          {/* USDC Wallet Balance Card */}
          <div className="bg-black/95 rounded-2xl p-8 border border-neutral-700 shadow-xl w-80 h-64 flex items-center justify-center">
            <div className="text-center">
              {isConnected ? (
                <div className="space-y-3">
                  <div className="text-xs text-neutral-400 uppercase tracking-wider">
                    Wallet Balance
                  </div>
                  <div className="text-4xl font-bold text-white">
                    {formatUsdcBalance(walletBalance as bigint | undefined)}
                  </div>
                  <div className="text-sm text-neutral-300">USDC</div>
                </div>
              ) : (
                <div className="text-neutral-500 text-sm">
                  Connect wallet to view balance
                </div>
              )}
            </div>
          </div>

          {/* Morpho Vault Balance Card */}
          <div className="bg-black/95 rounded-2xl p-8 border border-neutral-700 shadow-xl w-80 h-64 flex items-center justify-center">
            <div className="text-center">
              {isConnected ? (
                <div className="space-y-3">
                  <div className="text-xs text-neutral-400 uppercase tracking-wider">
                    Morpho Vault
                  </div>
                  <div className="text-4xl font-bold text-white">
                    {formatUsdcBalance(userVaultBalance)}
                  </div>
                  <div className="text-sm text-neutral-300">USDC</div>
                  <div className="text-sm text-green-400 font-semibold">
                    🌱 {vaultApy}% APY
                  </div>
                </div>
              ) : (
                <div className="text-neutral-500 text-sm">
                  Connect wallet to view balance
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-700 shadow-xl p-8 mb-6 flex flex-col items-center justify-center space-y-4">
          <OpenfortButton />
          {isConnected && (
            <div className="w-80 space-y-4">
              <button 
                onClick={handleSupply}
                disabled={isLoading}
                className="w-full bg-white text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg border border-gray-200 flex flex-row items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSupplying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Supplying...</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">️↗️</span>
                    Supply to pool
                  </>
                )}
              </button>

              <button 
                onClick={handleWithdraw}
                disabled={isLoading}
                className="w-full bg-white text-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg border border-gray-200 flex flex-row items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Withdrawing...</span>
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
