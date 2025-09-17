import { useState } from 'react';

export const useTradingState = () => {
  // Transfer state
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState<boolean>(false);

  // Buy state
  const [buyAmount, setBuyAmount] = useState<string>('');
  const [isBuying, setIsBuying] = useState<boolean>(false);

  // Sell state
  const [sellAmount, setSellAmount] = useState<string>('');
  const [isSelling, setIsSelling] = useState<boolean>(false);

  return {
    // Transfer state
    transferAmount,
    setTransferAmount,
    isTransferring,
    setIsTransferring,
    
    // Buy state
    buyAmount,
    setBuyAmount,
    isBuying,
    setIsBuying,
    
    // Sell state
    sellAmount,
    setSellAmount,
    isSelling,
    setIsSelling,
  };
}; 