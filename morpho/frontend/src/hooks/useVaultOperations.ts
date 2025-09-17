import { useState, useCallback, useMemo } from 'react';
import { useAccount, useReadContract, useWalletClient } from 'wagmi';
import { createPublicClient, http, parseAbi, type Address } from 'viem';
import { base } from 'viem/chains';
import { USDC_CONTRACT_ADDRESS, usdcAbi } from '../contracts/usdc';
import { SELECTED_BASE_MAINNET_RPC_URL } from '../lib/rpc';

const VAULT_ADDRESS = "0xbeeF010f9cb27031ad51e3333f9aF9C6B1228183";
const MINIMAL_VAULT_ABI = parseAbi([
  "function balanceOf(address account) external view returns (uint256)",
  "function convertToAssets(uint256 shares) external view returns (uint256)",
  "function deposit(uint256 assets, address receiver) external returns (uint256)",
  "function redeem(uint256 shares, address receiver, address owner) external returns (uint256)",
]);

export function useVaultOperations() {
  const [isSupplying, setIsSupplying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [userVaultBalance, setUserVaultBalance] = useState<bigint>(0n);

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const viemClient = useMemo(() => (
    createPublicClient({
      chain: base,
      transport: http(SELECTED_BASE_MAINNET_RPC_URL, {
        retryCount: 3,
        retryDelay: 1000,
        batch: { batchSize: 50, wait: 500 },
      }),
      batch: { multicall: { batchSize: 1024, wait: 200 } },
    })
  ), []);

  const { data: walletBalance, refetch: refetchWalletBalance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: usdcAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const fetchVaultBalance = useCallback(async () => {
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
  }, [address, viemClient]);

  const handleSupply = useCallback(async () => {
    if (!walletClient || !address || !walletBalance || walletBalance === 0n) return;

    setIsSupplying(true);
    try {
      await walletClient.writeContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: usdcAbi,
        functionName: 'approve',
        args: [VAULT_ADDRESS as `0x${string}`, walletBalance],
      });

      await new Promise(resolve => setTimeout(resolve, 5000));

      await walletClient.writeContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: MINIMAL_VAULT_ABI,
        functionName: 'deposit',
        args: [walletBalance, address as `0x${string}`],
      });

      setTimeout(() => {
        refetchWalletBalance();
        fetchVaultBalance();
      }, 5000);

    } catch (error: any) {
      alert(`Deposit failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSupplying(false);
    }
  }, [walletClient, address, walletBalance, refetchWalletBalance, fetchVaultBalance]);

  const handleWithdraw = useCallback(async () => {
    if (!walletClient || !address || !userVaultBalance || userVaultBalance === 0n) return;

    setIsWithdrawing(true);
    try {
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

      await walletClient.writeContract({
        address: VAULT_ADDRESS as Address,
        abi: MINIMAL_VAULT_ABI,
        functionName: 'redeem',
        args: [userShares, address as Address, address as Address],
        gas: 500000n,
      });

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
  }, [walletClient, address, userVaultBalance, viemClient, refetchWalletBalance, fetchVaultBalance]);

  return {
    isSupplying,
    isWithdrawing,
    walletBalance,
    userVaultBalance,
    handleSupply,
    handleWithdraw,
    fetchVaultBalance,
  };
}