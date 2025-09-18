export const HYPERLIQUID_TESTNET_HTTP_URL = "https://api.hyperliquid-testnet.xyz";
export const HYPERLIQUID_TESTNET_WS_URL = "wss://api.hyperliquid-testnet.xyz/ws";

export const HYPERLIQUID_USDC_TOKEN_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" as const;
export const HYPERLIQUID_USDC_DECIMALS = 6;

export const HYPE_ASSET_ID = 11035 as const; // 10000 + 1035 (spot asset index for orders)
export const HYPE_MARKET_ID = `@1035` as const; // Raw index for price queries
export const HYPE_SYMBOL = "HYPE";

export const PRICE_POLL_INTERVAL_MS = 3000;

export const DEFAULT_SLIPPAGE = 0.01; // 1% default slippage for trades
