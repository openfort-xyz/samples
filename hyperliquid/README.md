# Hyperliquid Trading Demo

## Overview
Expo React Native application showcasing how Openfort's embedded wallets integrate with Hyperliquid's testnet exchange. The sample mirrors the USDC transfer architecture so you can reuse onboarding, wallet recovery, and trading utilities across mobile projects.

## Project Structure
```
hyperliquid/
├── app/                  # Expo Router entrypoints and layout
├── components/           # Login, onboarding, and trading screens
├── constants/            # Network, asset, and polling configuration
├── services/             # Hyperliquid client and Shield recovery helpers
├── utils/                # Runtime configuration and transaction helpers
├── entrypoint.ts         # Expo entry shim
└── README.md             # Project documentation
```

## Features
- Openfort embedded wallet authentication with optional OAuth flows
- Hyperliquid price polling, balance display, and order placement helpers
- Guided trade flow with reusable onboarding and wallet-funding screens
- Shared project layout aligned with the USDC sample for rapid navigation

## Architecture
- **Expo Router (`app/`)** – Defines navigation shells and wraps the app with `OpenfortProvider`.
- **Screens (`components/`)** – Modular React Native components for login, onboarding, and trading.
- **Services & utils** – Typed Hyperliquid client, Shield recovery helpers, and environment readers.
- **Constants** – Centralised asset IDs, RPC endpoints, and polling intervals to keep trading logic consistent.

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI with an iOS Simulator or Android Emulator
- Hyperliquid mainnet account funded with ≥5 USDC to unlock the testnet faucet
- Openfort dashboard project with Shield configuration

### Environment Configuration
1. `cp .env.example .env.local`
2. Populate the file with real values:
   ```env
   OPENFORT_PROJECT_PUBLISHABLE_KEY=pk_test_your_publishable_key
   OPENFORT_SHIELD_PUBLISHABLE_KEY=pk_test_your_shield_key
   OPENFORT_SHIELD_ENCRYPTION_KEY=shield_encryption_key
   OPENFORT_SHIELD_RECOVERY_BASE_URL=https://your-recovery-api.com
   OPENFORT_ETHEREUM_PROVIDER_POLICY_ID=pol_your_policy_id
   HYPERLIQUID_WALLET_ADDRESS=0xYourWallet
   ```

### Install & Run
```bash
npm install
npm start           # Expo dev server
npm run ios         # Launch iOS simulator
npm run android     # Launch Android emulator
npm run web         # Optional web preview
```

## Usage Flow
1. Complete Hyperliquid faucet prerequisites, then start Metro (`npm start`).
2. Launch the app on a simulator or device and log in using Openfort (guest or OAuth).
3. Create an embedded wallet and verify Hyperliquid balances.
4. Use the guided trade flow to place sample buy/sell orders for HYPE ↔︎ USDC.
5. Extend the provided transfer stub once your custody/backend wiring is ready.

## Development
- Run `npm run lint` to enforce Expo + TypeScript linting.
- Monitor Metro logs for warnings and resolve them before submitting changes.
- Keep shared logic in hooks/services to align with the USDC sample’s patterns.

## Troubleshooting
- Ensure the Shield recovery endpoint is reachable from devices; unreachable URLs block login.
- Missing Hyperliquid faucet funds result in failed balance refreshes—top up regularly.
- If Expo cannot find credentials, confirm `.env.local` exists and Metro was restarted after edits.

## Resources
- [Openfort Documentation](https://docs.openfort.xyz)
- [Hyperliquid Testnet](https://app.hyperliquid-testnet.xyz/drip)
- [Expo React Native](https://expo.dev/)
