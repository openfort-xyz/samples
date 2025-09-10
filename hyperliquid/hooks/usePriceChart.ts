import { useState, useEffect } from 'react';

export const usePriceChart = (price: number | null, isLoading: boolean) => {
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);

  useEffect(() => {
    if (price && !isLoading) {
      const now = new Date();
      const timeLabel = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      setPriceHistory(prev => {
        const newHistory = [...prev, price];
        return newHistory.length > 20 ? newHistory.slice(-20) : newHistory;
      });
      
      setTimestamps(prev => {
        const newTimestamps = [...prev, timeLabel];
        return newTimestamps.length > 20 ? newTimestamps.slice(-20) : newTimestamps;
      });
    }
  }, [price, isLoading]);

  return {
    priceHistory,
    timestamps,
  };
}; 