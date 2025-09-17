import { Alert } from 'react-native';

import { HYPE_SYMBOL } from '../constants/hyperliquid';
import { transfer, buy, sell, DEFAULT_MIN_HYPE_ORDER_SIZE } from '../services/HyperliquidClient';

export interface TransactionHandlers {
  handleBuy: (
    activeWallet: any,
    openfortClient: any,
    buyAmount: string,
    hypeBalances: any,
    setIsBuying: (loading: boolean) => void,
    setBuyAmount: (amount: string) => void
  ) => Promise<boolean>;

  handleSell: (
    activeWallet: any,
    openfortClient: any,
    sellAmount: string,
    hypeBalances: any,
    setIsSelling: (loading: boolean) => void,
    setSellAmount: (amount: string) => void
  ) => Promise<boolean>;

  handleTransfer: (
    transferAmount: string,
    walletBalance: any,
    activeWallet: any,
    exportPrivateKey: () => Promise<string>,
    setIsTransferring: (loading: boolean) => void,
    setTransferAmount: (amount: string) => void,
    refetch: () => void
  ) => Promise<boolean>;
}

export const transactionHandlers: TransactionHandlers = {
  handleBuy: async (
    activeWallet: any,
    openfortClient: any,
    buyAmount,
    hypeBalances,
    setIsBuying,
    setBuyAmount
  ) => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid USDC amount to buy');
      return false;
    }

    const amount = parseFloat(buyAmount);
    const currentHypeBalance = parseFloat(hypeBalances?.account?.usdcBalance || '0');

    if (amount > currentHypeBalance) {
      Alert.alert('Insufficient Balance', 'Buy amount exceeds Hyperliquid USDC balance');
      return false;
    }

    if (amount < 1) {
      Alert.alert('Minimum Amount', 'Minimum buy amount is $1 USDC');
      return false;
    }

    setIsBuying(true);
    try {
      Alert.alert('Buy Order Initiated', `Buying ${HYPE_SYMBOL} with ${amount} USDC...`);

      const success = await buy(activeWallet, amount, 0.02, {
        openfortClient,
      });

      if (success) {
        setBuyAmount('');
        Alert.alert('Buy Order Complete', `Successfully bought ${HYPE_SYMBOL} with ${amount} USDC`);
        return true;
      } else {
        Alert.alert('Buy Order Failed', 'Failed to execute buy order');
        return false;
      }
    } catch (error) {
      console.error('Buy error:', error);
      Alert.alert('Buy Order Failed', `Failed to execute buy order: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsBuying(false);
    }
    return false;
  },

  handleSell: async (
    activeWallet: any,
    openfortClient: any,
    sellAmount,
    hypeBalances,
    setIsSelling,
    setSellAmount
  ) => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      Alert.alert('Invalid Amount', `Please enter a valid ${HYPE_SYMBOL} amount to sell`);
      return false;
    }

    const amount = parseFloat(sellAmount);
    const hypePosition = hypeBalances?.account?.assetPositions?.find((pos: any) => pos.coin === HYPE_SYMBOL);
    const currentHypeBalance = parseFloat(hypePosition?.total || '0');

    if (amount > currentHypeBalance) {
      Alert.alert('Insufficient Balance', `Sell amount exceeds ${HYPE_SYMBOL} balance`);
      return false;
    }

    if (amount < DEFAULT_MIN_HYPE_ORDER_SIZE) {
      Alert.alert('Minimum Amount', `Minimum sell amount is ${DEFAULT_MIN_HYPE_ORDER_SIZE} ${HYPE_SYMBOL}`);
      return false;
    }

    setIsSelling(true);

    try {
      const success = await sell(activeWallet, amount, 0.01, {
        openfortClient,
      });

      if (success) {
        Alert.alert('Success', `${HYPE_SYMBOL} sell order placed successfully!`);
        setSellAmount('');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sell error:', error);
      Alert.alert('Sell Error', error instanceof Error ? error.message : `Failed to sell ${HYPE_SYMBOL}`);
      return false;
    } finally {
      setIsSelling(false);
    }
    return false;
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
      return false;
    }

    const amount = parseFloat(transferAmount);
    const currentWalletBalance = parseFloat(walletBalance?.toString() || '0');

    if (amount > currentWalletBalance) {
      Alert.alert('Insufficient Balance', 'Transfer amount exceeds wallet balance');
      return false;
    }

    if (amount < 5) {
      Alert.alert('Invalid Amount', 'Transfer amount must be greater than 5 USDC');
      return false;
    }

    if (!activeWallet) {
      Alert.alert('No Wallet', 'No active wallet found');
      return false;
    }

    setIsTransferring(true);
    try {
      console.log('Transferring', transferAmount, 'USDC to Hyperliquid');
      const success = await transfer(activeWallet, amount);
      if (success) {
        setTransferAmount('');
        refetch();
        Alert.alert('Transfer Complete', `Successfully transferred ${amount} USDC`);
        return true;
      }
      Alert.alert('Transfer Failed', 'Failed to transfer funds. Please try again.');
      return false;
    } catch (error) {
      console.error('Transfer error:', error);
      Alert.alert('Transfer Failed', 'Failed to transfer funds. Please try again.');
      return false;
    } finally {
      setIsTransferring(false);
    }
    return false;
  }
};

export const getMaxAmount = (balance: any): string => {
  return balance?.toString() || '0';
}; 
