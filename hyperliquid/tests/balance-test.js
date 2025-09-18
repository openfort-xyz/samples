const fetch = require('node-fetch');

// Test wallet address that's connected to Hyperliquid
const HYPERLIQUID_WALLET = '0x63bae04d206ee365d73c5d0876fa5d1f961492a1';
const HYPERLIQUID_TESTNET_URL = 'https://api.hyperliquid-testnet.xyz';

async function testBalances() {
  console.log('Testing balance retrieval for wallet:', HYPERLIQUID_WALLET);

  try {
    // Test clearinghouse state (for USDC and positions)
    console.log('\n=== Testing Clearinghouse State ===');
    const clearinghouseResponse = await fetch(`${HYPERLIQUID_TESTNET_URL}/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'clearinghouseState',
        user: HYPERLIQUID_WALLET
      })
    });

    const clearinghouseData = await clearinghouseResponse.json();
    console.log('Clearinghouse response:', JSON.stringify(clearinghouseData, null, 2));

    // Test spot clearinghouse state
    console.log('\n=== Testing Spot Clearinghouse State ===');
    const spotResponse = await fetch(`${HYPERLIQUID_TESTNET_URL}/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'spotClearinghouseState',
        user: HYPERLIQUID_WALLET
      })
    });

    const spotData = await spotResponse.json();
    console.log('Spot clearinghouse response:', JSON.stringify(spotData, null, 2));

    // Extract and display expected values
    console.log('\n=== Expected Values ===');

    // USDC balance from spot clearinghouse
    const spotBalances = spotData?.balances || [];
    const usdcBalance = spotBalances.find(b => b.coin === 'USDC');
    console.log('USDC Balance (Spot):', usdcBalance?.total || '0');

    // HYPE balance from spot clearinghouse
    const hypeBalance = spotBalances.find(b => b.coin === 'HYPE');
    console.log('HYPE Balance:', hypeBalance?.total || '0');

    // Also check if HYPE is in regular clearinghouse
    const regularBalances = clearinghouseData?.balances || [];
    const regularHypeBalance = regularBalances.find(b => b.coin === 'HYPE');
    if (regularHypeBalance) {
      console.log('HYPE Balance (Regular):', regularHypeBalance.total);
    }

  } catch (error) {
    console.error('Error testing balances:', error);
  }
}

testBalances();