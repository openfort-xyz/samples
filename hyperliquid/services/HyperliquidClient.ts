import '../polyfills';
import * as Hyperliquid from "@nktkas/hyperliquid";
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const wsTransport = new Hyperliquid.WebSocketTransport({});
const httpTransport = new Hyperliquid.HttpTransport({isTestnet: true});

const infoClient = new Hyperliquid.InfoClient({
    transport: httpTransport, 
});

const priceClient = new Hyperliquid.InfoClient({
    transport: wsTransport, 
});

export const createExchangeClient = (privateKey: string) => {
    const wallet = new ethers.Wallet(privateKey);
    return new Hyperliquid.ExchangeClient({
        wallet: wallet,
        transport: httpTransport,
    });
};

// HYPE/USDC price
export const useHypeUsdc = (intervalMs = 3000) => {
    const [price, setPrice] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                // const allMids = await infoClient.allMids();
                const allMids = await priceClient.allMids();
                // if (allMids['@1035']) {
                //     setPrice(Number(allMids['@1035']));
                //     setError(null);
                if (allMids['@107']) {
                    setPrice(Number(allMids['@107']));
                    setError(null);
                } else {
                    setError('Asset @107 not found');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
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

// Hyperliquid account + positions balances
export const useHypeBalances = (address: `0x${string}` | undefined) => {
    const [balances, setBalances] = useState<{ account: any; positions: any } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBalances = useCallback(async () => {
        if (!address) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const clearinghouseState = await infoClient.spotClearinghouseState({
                // user: address,
                user: "0x33837D618394D95FdEe51Fb1e7F00596797E18C5"
            });

            const usdcBalance = clearinghouseState?.balances?.find((b: any) => b.coin === "USDC");
            const hypeBalance = clearinghouseState?.balances?.find((b: any) => b.coin === "HYPE");
            const usdcTotal = usdcBalance ? usdcBalance.total : null;

            const accountData = {
                usdcBalance: usdcTotal,
                assetPositions: clearinghouseState?.balances || []
            };

            const positionsData = {
                totalValue: 0,
                openPositions: [],
                unrealizedPnl: 0,
                hypePosition: hypeBalance ? {
                    coin: "HYPE",
                    total: hypeBalance.total || "0",
                    hold: hypeBalance.hold || "0",
                    entryNtl: hypeBalance.entryNtl || "0"
                } : null
            };
            
            setBalances({ 
                account: accountData, 
                positions: positionsData 
            });
            setError(null);
        } catch (err) {
            console.error("Failed to fetch Hyperliquid balances:", err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    }, [address]);

    useEffect(() => {
        fetchBalances();
    }, [fetchBalances]);

    return { balances, isLoading, error, refetch: fetchBalances };
};

// Transfer USDC to Hyperliquid 
export const transfer = async (
    activeWallet: any, 
    amount: number
): Promise<boolean> => {
    // try {
        
    //     // Use hardcoded private key
    //     const privateKey = "";
        
    //     // Create exchange client with testnet flag
    //     const exchangeClient = new Hyperliquid.ExchangeClient({
    //         wallet: privateKey,
    //         transport: new Hyperliquid.HttpTransport({ isTestnet: true })
    //     });
        
    //     return true;
        
    // } catch (error) {
    //     console.error('Transfer to Hyperliquid failed:', error);
    //     throw error;
    // }
};

// Buy HYPE using USDC on Hyperliquid
export const buy = async (
    activeWallet: any,
    amount: number, 
    slippage: number = 0.01 
): Promise<boolean> => {
    try {
        console.log('Attempting to buy HYPE with', amount, 'USDC using raw API');
        
        const provider = await activeWallet.getProvider();
        
        const allMids = await infoClient.allMids();
        const hypePrice = allMids["@1035"]; 
        if (!hypePrice) {
            throw new Error('HYPE price not found in market data');
        }
        
        const buyPrice = parseFloat(hypePrice) * (1 + slippage); 
        const quantity = Math.floor((amount / buyPrice) * 1000) / 1000; 
        
        console.log('Calculated buy order:');
        console.log('- Mid price:', parseFloat(hypePrice).toFixed(6), 'USDC');
        console.log('- Buy price (with slippage):', buyPrice.toFixed(6), 'USDC');
        console.log('- Quantity:', quantity, 'HYPE');
        
        const orderWire = {
            a: 1035,                    // HYPE asset id
            b: true,                    // isBuy
            p: buyPrice.toFixed(6),     // limit price as string
            s: quantity.toString(),     // size as string
            r: false,                   // reduceOnly
            t: {
                limit: { tif: "Ioc" }   // Immediate or Cancel
            }
        };
        
        const action = {
            type: "order",
            orders: [orderWire],
            grouping: "na",
        };
        
        const domain = {
            name: "HyperliquidSignTransaction",
            version: "1",
            chainId: 421614, 
            verifyingContract: "0x0000000000000000000000000000000000000000",
        };
        
        const types = {
            "HyperliquidTransaction:Order": [
                { name: "type", type: "string" },
                { name: "orders", type: "string" },
                { name: "grouping", type: "string" },
            ],
        };
        
        const message = {
            ...action,
            orders: JSON.stringify(action.orders),
        };
        
        const signatureHex = await provider.request({
            method: 'eth_signTypedData_v4',
            params: [activeWallet.address, JSON.stringify({
                domain,
                types,
                primaryType: 'HyperliquidTransaction:Order',
                message
            })]
        });
        
        console.log('Signed order hex:', signatureHex);
        
        const signature = {
            r: signatureHex.slice(0, 66), 
            s: signatureHex.slice(66, 130),  
            v: parseInt(signatureHex.slice(130, 132), 16) 
        };
        
        console.log('Parsed signature:', signature);
        
        const response = await fetch("https://api.hyperliquid-testnet.xyz/exchange", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                action, 
                signature, 
                nonce: Date.now() 
            }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Buy order result:', result);
        
        if (result.response?.type === 'order') {
            const statuses = result.response.data.statuses;
            const firstStatus = statuses[0];
            
            if ('filled' in firstStatus) {
                console.log('Order filled successfully!');
                console.log('- Filled size:', firstStatus.filled.totalSz);
                console.log('- Average price:', firstStatus.filled.avgPx);
                return true;
            } else if ('resting' in firstStatus) {
                console.log('Order placed but not filled immediately');
                console.log('- Order ID:', firstStatus.resting.oid);
                return true;
            } else if ('error' in firstStatus) {
                throw new Error(`Order failed: ${firstStatus.error}`);
            }
        }
        
        throw new Error('Unexpected order response format');
        
    } catch (error) {
        console.error('Buy HYPE failed:', error);
        throw error;
    }
};

// Sell HYPE using USDC on Hyperliquid
export const sell = async (
    activeWallet: any,
    amount: number, 
    slippage: number = 0.01 
): Promise<boolean> => {
    try {
        console.log('Attempting to sell', amount, 'HYPE using raw API');
        
        const provider = await activeWallet.getProvider();
        
        const allMids = await infoClient.allMids();
        const hypePrice = allMids["@1035"]; 
        if (!hypePrice) {
            throw new Error('HYPE price not found in market data');
        }
        
        const sellPrice = parseFloat(hypePrice) * (1 - slippage); 
        const quantity = Math.floor(amount * 1000) / 1000; 
        
        console.log('Calculated sell order:');
        console.log('- Mid price:', parseFloat(hypePrice).toFixed(6), 'USDC');
        console.log('- Sell price (with slippage):', sellPrice.toFixed(6), 'USDC');
        console.log('- Quantity:', quantity, 'HYPE');
        
        const orderWire = {
            a: 1035,                    // HYPE asset id
            b: false,                   // isBuy = false (sell)
            p: sellPrice.toFixed(6),    // limit price as string
            s: quantity.toString(),     // size as string
            r: false,                   // reduceOnly
            t: {
                limit: { tif: "Ioc" }   // Immediate or Cancel
            }
        };
        
        const action = {
            type: "order",
            orders: [orderWire],
            grouping: "na",
        };
        
        const domain = {
            name: "HyperliquidSignTransaction",
            version: "1",
            chainId: 421614, 
            verifyingContract: "0x0000000000000000000000000000000000000000",
        };
        
        const types = {
            "HyperliquidTransaction:Order": [
                { name: "type", type: "string" },
                { name: "orders", type: "string" },
                { name: "grouping", type: "string" },
            ],
        };
        
        const message = {
            ...action,
            orders: JSON.stringify(action.orders),
        };
        
        const signatureHex = await provider.request({
            method: 'eth_signTypedData_v4',
            params: [activeWallet.address, JSON.stringify({
                domain,
                types,
                primaryType: 'HyperliquidTransaction:Order',
                message
            })]
        });
        
        console.log('Signed sell order hex:', signatureHex);
        
        const signature = {
            r: signatureHex.slice(0, 66), 
            s: signatureHex.slice(66, 130),  
            v: parseInt(signatureHex.slice(130, 132), 16) 
        };
        
        console.log('Parsed sell signature:', signature);
        
        const response = await fetch("https://api.hyperliquid-testnet.xyz/exchange", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                action, 
                signature, 
                nonce: Date.now() 
            }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Sell order result:', result);
        
        if (result.response?.type === 'order') {
            const statuses = result.response.data.statuses;
            const firstStatus = statuses[0];
            
            if ('filled' in firstStatus) {
                console.log('Sell order filled successfully!');
                console.log('- Filled size:', firstStatus.filled.totalSz);
                console.log('- Average price:', firstStatus.filled.avgPx);
                return true;
            } else if ('resting' in firstStatus) {
                console.log('Sell order placed but not filled immediately');
                console.log('- Order ID:', firstStatus.resting.oid);
                return true;
            } else if ('error' in firstStatus) {
                throw new Error(`Sell order failed: ${firstStatus.error}`);
            }
        }
        
        throw new Error('Unexpected sell order response format');
        
    } catch (error) {
        console.error('Sell HYPE failed:', error);
        throw error;
    }
};