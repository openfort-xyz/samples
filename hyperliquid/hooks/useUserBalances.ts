import { useEffect, useState, useCallback, useMemo } from "react";
import { ethers } from "ethers";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export const useWalletBalance = (walletAddress?: string) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  const provider = useMemo(() => new ethers.JsonRpcProvider("https://sepolia-rollup.arbitrum.io/rpc"), []);
  const tokenContract = useMemo(() => new ethers.Contract("0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", ERC20_ABI, provider), [provider]);
  
  const fetchBalance = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const [rawBalance, decimals] = await Promise.all([
        tokenContract.balanceOf(walletAddress),
        tokenContract.decimals()
      ]);
      const formattedBalance = Number(ethers.formatUnits(rawBalance, decimals));
      setBalance(formattedBalance);
    } catch (e) {
      console.error(e);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [tokenContract, walletAddress]);

  useEffect(() => {
    if (!walletAddress) return;
    console.log("fetching balance");
    fetchBalance();
  }, [walletAddress, fetchBalance]);

  return { balance, loading, refetch: fetchBalance };
};
