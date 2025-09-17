// Test basic fetch to the Hyperliquid API
const HYPERLIQUID_TESTNET_HTTP_URL = "https://api.hyperliquid-testnet.xyz";

async function testBasicFetch() {
    console.log("Testing basic fetch to Hyperliquid API...");

    try {
        const response = await fetch(`${HYPERLIQUID_TESTNET_HTTP_URL}/info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'allMids'
            })
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("HYPE price (@107):", data['@107']);
        console.log("✅ Basic fetch successful");

    } catch (error) {
        console.error("❌ Basic fetch failed:", error);
        console.error("Error message:", error.message);
    }
}

testBasicFetch();