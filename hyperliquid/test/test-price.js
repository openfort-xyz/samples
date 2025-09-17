const Hyperliquid = require("@nktkas/hyperliquid");

const HYPE_MARKET_ID = "@107";

async function testPriceAPI() {
    console.log("Testing Hyperliquid price API...");

    try {
        // Test with HTTP transport (same as the app)
        const httpTransport = new Hyperliquid.HttpTransport({
            isTestnet: true,
        });

        const infoClient = new Hyperliquid.InfoClient({
            transport: httpTransport,
        });

        console.log("Fetching all mids...");
        const allMids = await infoClient.allMids();
        console.log("All mids response:", allMids);

        const hypePrice = allMids[HYPE_MARKET_ID];
        console.log(`HYPE price for market ${HYPE_MARKET_ID}:`, hypePrice);

        if (hypePrice) {
            console.log(`✅ HYPE/USDC price: $${hypePrice} (expected around $54.77)`);
        } else {
            console.log("❌ HYPE price not found in market data");
            console.log("Available markets:", Object.keys(allMids));
        }

    } catch (error) {
        console.error("❌ Error fetching price:", error);
        console.error("Error details:", error.message);
        console.error("Stack:", error.stack);
    }
}

testPriceAPI();