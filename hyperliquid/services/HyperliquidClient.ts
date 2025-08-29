import '../polyfills';
import * as Hyperliquid from "@nktkas/hyperliquid";
import { useState, useEffect } from 'react';


const wsTransport = new Hyperliquid.WebSocketTransport();

const infoClient = new Hyperliquid.InfoClient({
    transport: wsTransport, 
});

// const exchClient = new Hyperliquid.ExchangeClient({
//     wallet: activeWallet,
//     transport: wsTransport,
// });

// const subsClient = new Hyperliquid.SubscriptionClient({
//     transport: wsTransport,
// });

export const useHypeUsdc = (intervalMs = 3000) => {
    const [price, setPrice] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const allMids = await infoClient.allMids();
                if (allMids['@107']) {
                    setPrice(Number(allMids['@107']));
                    setError(null);
                } else {
                    setError('Asset @107 not found');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                console.error('Error fetching price:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPrice();
        const interval = setInterval(fetchPrice, intervalMs);
        return () => clearInterval(interval);
    }, [intervalMs]);
    return { price, isLoading, error };
};

export const useHypeBalances = (address: `0x${string}` | undefined) => {
    const [balances, setBalances] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!address) {
            setIsLoading(false);
            return;
        }

        const fetchBalances = async () => {
            try {
                const balances = await infoClient.userVaultEquities({
                    user: address,
                });
                console.log(balances);
                setBalances(balances);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                console.error('Error fetching balances:', err);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchBalances();
    }, [address]);

    return { balances, isLoading, error };
};