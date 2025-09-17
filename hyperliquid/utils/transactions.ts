import { Alert } from 'react-native';
import { transfer, buy, sell } from '../services/HyperliquidClient';

export interface TransactionHandlers {
  handleBuy: (
    activeWallet: any,
    buyAmount: string,
    hypeBalances: any,
    setIsBuying: (loading: boolean) => void,
    setBuyAmount: (amount: string) => void
  ) => Promise<void>;

  handleSell: (
    activeWallet: any,
    sellAmount: string,
    hypeBalances: any,
    setIsSelling: (loading: boolean) => void,
    setSellAmount: (amount: string) => void
  ) => Promise<void>;

  handleTransfer: (
    transferAmount: string,
    walletBalance: any,
    activeWallet: any,
    exportPrivateKey: () => Promise<string>,
    setIsTransferring: (loading: boolean) => void,
    setTransferAmount: (amount: string) => void,
    refetch: () => void
  ) => Promise<void>;
}

export const transactionHandlers: TransactionHandlers = {
  handleBuy: async (
    activeWallet: any,
    buyAmount,
    hypeBalances,
    setIsBuying,
    setBuyAmount
  ) => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid USDC amount to buy');
      return;
    }

    const amount = parseFloat(buyAmount);
    const currentHypeBalance = parseFloat(hypeBalances?.account?.usdcBalance || '0');

    if (amount > currentHypeBalance) {
      Alert.alert('Insufficient Balance', 'Buy amount exceeds Hyperliquid USDC balance');
      return;
    }

    if (amount < 1) {
      Alert.alert('Minimum Amount', 'Minimum buy amount is $1 USDC');
      return;
    }

    setIsBuying(true);
    try {
      Alert.alert('Buy Order Initiated', `Buying HYPE with ${amount} USDC...`);

      const success = await buy(activeWallet, amount, 0.02);

      if (success) {
        setBuyAmount('');
        Alert.alert('Buy Order Complete', `Successfully bought HYPE with ${amount} USDC`);
      } else {
        Alert.alert('Buy Order Failed', 'Failed to execute buy order');
      }
    } catch (error) {
      console.error('Buy error:', error);
      Alert.alert('Buy Order Failed', `Failed to execute buy order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsBuying(false);
    }
  },

  handleSell: async (
    activeWallet: any,
    sellAmount,
    hypeBalances,
    setIsSelling,
    setSellAmount
  ) => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid HYPE amount to sell');
      return;
    }

    const amount = parseFloat(sellAmount);
    const hypePosition = hypeBalances?.account?.assetPositions?.find((pos: any) => pos.coin === 'HYPE');
    const currentHypeBalance = parseFloat(hypePosition?.total || '0');

    if (amount > currentHypeBalance) {
      Alert.alert('Insufficient Balance', 'Sell amount exceeds HYPE balance');
      return;
    }

    if (amount < 0.001) {
      Alert.alert('Minimum Amount', 'Minimum sell amount is 0.001 HYPE');
      return;
    }

    setIsSelling(true);

    try {
      const success = await sell(activeWallet, amount);

      if (success) {
        Alert.alert('Success', 'HYPE sell order placed successfully!');
        setSellAmount('');
      }
    } catch (error) {
      console.error('Sell error:', error);
      Alert.alert('Sell Error', error instanceof Error ? error.message : 'Failed to sell HYPE');
    } finally {
      setIsSelling(false);
    }
  },

  handleTransfer: async (
    transferAmount,
    walletBalance,
    activeWallet,
    exportPrivateKey,
    setIsTransferring,
    setTransferAmount,
    refetch
  ) => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid transfer amount');
      return;
    }

    const amount = parseFloat(transferAmount);
    const currentWalletBalance = parseFloat(walletBalance?.toString() || '0');

    if (amount > currentWalletBalance) {
      Alert.alert('Insufficient Balance', 'Transfer amount exceeds wallet balance');
      return;
    }

    if (amount < 5) {
      Alert.alert('Invalid Amount', 'Transfer amount must be greater than 5 USDC');
      return;
    }

    if (!activeWallet) {
      Alert.alert('No Wallet', 'No active wallet found');
      return;
    }

    setIsTransferring(true);
    try {
      console.log('Transferring', transferAmount, 'USDC to Hyperliquid');
      await transfer(activeWallet, amount);
      setTransferAmount('');
      refetch();
      Alert.alert('Transfer Complete', `Successfully transferred ${amount} USDC`);
    } catch (error) {
      console.error('Transfer error:', error);
      Alert.alert('Transfer Failed', 'Failed to transfer funds. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  }
};

export const getMaxAmount = (balance: any): string => {
  return balance?.toString() || '0';
}; 