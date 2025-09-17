import "../polyfills";
import * as Hyperliquid from "@nktkas/hyperliquid";
import { actionSorter, createL1ActionHash } from "@nktkas/hyperliquid/signing";
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

import {
  HYPE_ASSET_ID,
  HYPE_MARKET_ID,
  HYPE_SYMBOL,
  HYPERLIQUID_TESTNET_HTTP_URL,
  PRICE_POLL_INTERVAL_MS,
} from "../constants/hyperliquid";

// Removed WebSocket transport - using HTTP transport for better React Native compatibility
const httpTransport = new Hyperliquid.HttpTransport({
  isTestnet: true,
});

const infoClient = new Hyperliquid.InfoClient({
    transport: httpTransport, 
});

// Removed priceClient using WebSocket transport - using HTTP transport instead

const EXCHANGE_ENDPOINT = `${HYPERLIQUID_TESTNET_HTTP_URL}/exchange`;
const IS_TESTNET = HYPERLIQUID_TESTNET_HTTP_URL.toLowerCase().includes("testnet");

export const createExchangeClient = (privateKey: string) => {
    const wallet = new ethers.Wallet(privateKey);
    return new Hyperliquid.ExchangeClient({
        wallet: wallet,
        transport: httpTransport,
    });
};

type OrderAction = ReturnType<typeof actionSorter.order>;

type EmbeddedWalletSigner = {
    signTypedData?: (
        domain: Record<string, unknown>,
        types: Record<string, Array<{ name: string; type: string }>>,
        message: Record<string, unknown>
    ) => Promise<string>;
    exportPrivateKey?: () => Promise<string>;
};

const signAndSubmitOrder = async (
    params: {
        activeWallet: any;
        action: OrderAction;
        embeddedWallet?: EmbeddedWalletSigner;
    }
) => {
    const { activeWallet, action, embeddedWallet } = params;
    const nonce = Date.now();
    const actionHash = createL1ActionHash({ action, nonce });

    const domain = {
        name: "Exchange",
        version: "1",
        chainId: 1337,
        verifyingContract: "0x0000000000000000000000000000000000000000",
    };

    const types = {
        Agent: [
            { name: "source", type: "string" },
            { name: "connectionId", type: "bytes32" },
        ],
    };

    const message = {
        source: IS_TESTNET ? "b" : "a",
        connectionId: actionHash,
    };

    let signatureHex: string | undefined;

    if (embeddedWallet?.signTypedData) {
        signatureHex = await embeddedWallet.signTypedData(
            domain,
            {
                EIP712Domain: [
                    { name: "name", type: "string" },
                    { name: "version", type: "string" },
                    { name: "chainId", type: "uint256" },
                    { name: "verifyingContract", type: "address" },
                ],
                ...types,
            },
            message
        );
    } else {
        const provider = await activeWallet.getProvider();
        try {
            signatureHex = await provider.request({
                method: 'eth_signTypedData_v4',
                params: [
                    activeWallet.address,
                    JSON.stringify({
                        domain,
                        types,
                        primaryType: 'Agent',
                        message,
                    }),
                ],
            });
        } catch (error: any) {
            const message = error?.message ?? 'Unknown provider error';
            throw new Error(`Unable to sign Hyperliquid order: ${message}`);
        }
    }

    if (!signatureHex) {
        throw new Error('Failed to obtain signature for Hyperliquid order');
    }

    console.log('Signed order hex:', signatureHex);

    const signature = ethers.Signature.from(signatureHex);
    const signatureWire = {
        r: signature.r,
        s: signature.s,
        v: signature.v,
    };

    console.log('Parsed signature:', signatureWire);

    const response = await fetch(EXCHANGE_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            action,
            signature: signatureWire,
            nonce,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    return await response.json();
};

// HYPE/USDC price
export const useHypeUsdc = (intervalMs = PRICE_POLL_INTERVAL_MS) => {
    const [price, setPrice] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                // Use HTTP transport instead of WebSocket for better reliability in React Native
                const allMids = await infoClient.allMids();
                const value = allMids[HYPE_MARKET_ID];
                if (!value) {
                    throw new Error(`Asset ${HYPE_MARKET_ID} not found`);
                }
                setPrice(Number(value));
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        };

        // Initial fetch
        fetchPrice();

        // Set up interval for subsequent fetches
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
            setBalances(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const clearinghouseState = await infoClient.spotClearinghouseState({
                user: address,
            });

            const usdcBalance = clearinghouseState?.balances?.find((b: any) => b.coin === "USDC");
            const hypeBalance = clearinghouseState?.balances?.find((b: any) => b.coin === HYPE_SYMBOL);
            const usdcTotal = usdcBalance ? usdcBalance.total : null;

            const accountData = {
                usdcBalance: usdcTotal,
                assetPositions: clearinghouseState?.balances || []
            };

            const positionsData = {
                totalValue: 0,
                openPositions: [],
                unrealizedPnl: 0,
                hypePosition: hypeBalance
                    ? {
                        coin: HYPE_SYMBOL,
                        total: hypeBalance.total || "0",
                        hold: hypeBalance.hold || "0",
                        entryNtl: hypeBalance.entryNtl || "0",
                    }
                    : null,
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
    /*
     * Reference implementation (from commit 46ad2404644658f40c20d0a5f8a3b0bdc2b565f5^)
     * kept for easy copy/paste when wiring real transfers:
     *
     * try {
     *   // Use hardcoded private key
     *   const privateKey = "";
     *
     *   // Create exchange client with testnet flag
     *   const exchangeClient = new Hyperliquid.ExchangeClient({
     *     wallet: privateKey,
     *     transport: new Hyperliquid.HttpTransport({ isTestnet: true })
     *   });
     *
     *   // TODO: invoke exchangeClient to submit deposit transaction
     *   return true;
     * } catch (error) {
     *   console.error('Transfer to Hyperliquid failed:', error);
     *   throw error;
     * }
     */

    // Transfer functionality to be implemented
    console.log('Transfer function called with:', { activeWallet: activeWallet.address, amount });
    return false;
};

// Buy HYPE using USDC on Hyperliquid
export const buy = async (
    activeWallet: any,
    amount: number,
    slippage: number = 0.01,
    options?: { openfortClient?: { embeddedWallet?: EmbeddedWalletSigner } }
): Promise<boolean> => {
    try {
        console.log('Attempting to buy HYPE with', amount, 'USDC');

        const allMids = await infoClient.allMids();
        const hypePrice = allMids[HYPE_MARKET_ID];
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
            a: HYPE_ASSET_ID,
            b: true,
            p: buyPrice.toFixed(6),
            s: quantity.toFixed(3),
            r: false,
            t: {
                limit: { tif: "Ioc" },
            },
        };

        const embeddedWallet = options?.openfortClient?.embeddedWallet;

        let result;
        let privateKeyHex: string | null = null;

        if (typeof activeWallet.getPrivateKey === 'function') {
            try {
                privateKeyHex = await activeWallet.getPrivateKey();
            } catch (err) {
                console.warn('activeWallet.getPrivateKey failed, will try other signing paths:', err);
                privateKeyHex = null;
            }
        }

        if (!privateKeyHex && embeddedWallet?.exportPrivateKey) {
            try {
                privateKeyHex = await embeddedWallet.exportPrivateKey();
            } catch (err) {
                console.warn('embeddedWallet.exportPrivateKey failed, falling back to direct signing:', err);
                privateKeyHex = null;
            }
        }

        if (privateKeyHex && !privateKeyHex.startsWith('0x')) {
            privateKeyHex = `0x${privateKeyHex}`;
        }

        if (privateKeyHex) {
            const exchangeClient = createExchangeClient(privateKeyHex);
            result = await exchangeClient.order({
                orders: [orderWire],
                grouping: "na",
            });
        } else {
            const action = actionSorter.order({
                type: "order",
                orders: [orderWire],
                grouping: "na",
            });
            result = await signAndSubmitOrder({
                activeWallet,
                action,
                embeddedWallet,
            });
        }

        console.log('Buy order result:', result);

        // Handle the exchange response
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

        throw new Error(`Unexpected order response format: ${JSON.stringify(result)}`);

    } catch (error) {
        console.error('Buy HYPE failed:', error);
        throw error;
    }
};

// Sell HYPE using USDC on Hyperliquid
export const sell = async (
    activeWallet: any,
    amount: number,
    slippage: number = 0.01,
    options?: { openfortClient?: { embeddedWallet?: EmbeddedWalletSigner } }
): Promise<boolean> => {
    try {
        console.log('Attempting to sell', amount, 'HYPE');

        const allMids = await infoClient.allMids();
        const hypePrice = allMids[HYPE_MARKET_ID];
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
            a: HYPE_ASSET_ID,
            b: false,
            p: sellPrice.toFixed(6),
            s: quantity.toFixed(3),
            r: false,
            t: {
                limit: { tif: "Ioc" },
            },
        };

        const embeddedWallet = options?.openfortClient?.embeddedWallet;

        let result;
        let privateKeyHex: string | null = null;

        if (typeof activeWallet.getPrivateKey === 'function') {
            try {
                privateKeyHex = await activeWallet.getPrivateKey();
            } catch (err) {
                console.warn('activeWallet.getPrivateKey failed, will try other signing paths:', err);
                privateKeyHex = null;
            }
        }

        if (!privateKeyHex && embeddedWallet?.exportPrivateKey) {
            try {
                privateKeyHex = await embeddedWallet.exportPrivateKey();
            } catch (err) {
                console.warn('embeddedWallet.exportPrivateKey failed, falling back to direct signing:', err);
                privateKeyHex = null;
            }
        }

        if (privateKeyHex && !privateKeyHex.startsWith('0x')) {
            privateKeyHex = `0x${privateKeyHex}`;
        }

        if (privateKeyHex) {
            const exchangeClient = createExchangeClient(privateKeyHex);
            result = await exchangeClient.order({
                orders: [orderWire],
                grouping: "na",
            });
        } else {
            const action = actionSorter.order({
                type: "order",
                orders: [orderWire],
                grouping: "na",
            });
            result = await signAndSubmitOrder({
                activeWallet,
                action,
                embeddedWallet,
            });
        }

        console.log('Sell order result:', result);

        // Handle the exchange response
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

        throw new Error(`Unexpected sell order response format: ${JSON.stringify(result)}`);

    } catch (error) {
        console.error('Sell HYPE failed:', error);
        throw error;
    }
};
