# Openfort × Morpho Sample

This sample pairs an Openfort embedded wallet front end with a minimal Node.js helper service to interact with a Morpho Blue USDC vault on Base. The React app lets a connected Openfort wallet supply its entire USDC balance to the vault or withdraw everything back, while the backend issues encryption sessions against the Openfort Shield API so wallet secrets never touch the client.

## Project structure
- `backend/` – Express server that proxies `create-encryption-session` requests to `shield.openfort.io` and exposes a health check. Uses `dotenv`, enables CORS, and is ready to deploy as-is.
- `frontend/` – Vite + React + Wagmi app that embeds Openfort, queries vault state via the Morpho GraphQL API, and performs USDC approvals/deposits or share redemptions with viem.

## Prerequisites
- Node.js **18 or newer** (provides the global `fetch` used by the backend).
- Package manager: npm ≥9.
- Openfort account with:
  - Publishable key (`pk_…`)
  - Shield publishable key
  - Shield API key & secret key
  - (Optional) policy ID (`pol_…`) when you want to enforce specific provider rules
- WalletConnect Project ID (optional; falls back to `demo`).
- Morpho Blue vault address (defaulted to `0xbeeF010f9cb27031ad51e3333f9aF9C6B1228183` in the hooks) and Base RPC endpoint.

## Configuration
1. **Backend environment** (`backend/.env` based on `backend/.env.example`):
   - `NEXT_PUBLIC_SHIELD_API_KEY` – Shield API key from the Openfort dashboard.
   - `NEXTAUTH_SHIELD_SECRET_KEY` – Shield secret key.
   - `NEXTAUTH_SHIELD_ENCRYPTION_SHARE` – Your encryption share.
   - `PORT` *(optional, default `3001`)* – Port for the Express server.
   - `FRONTEND_URL` or `CORS_ORIGIN` – URL allowed by CORS (e.g. `http://localhost:5173`).
   - `BACKEND_URL` – Public URL of this service (used by the frontend for API calls).

2. **Frontend environment** (`frontend/.env` based on `frontend/.env.example`):
   - `VITE_OPENFORT_PUBLISHABLE_KEY` – Client publishable key (must start with `pk_`).
   - `VITE_OPENFORT_SHIELD_PUBLIC_KEY` – Shield publishable key.
   - `VITE_OPENFORT_POLICY_ID` *(optional)* – Policy for the embedded provider (`pol_…`).
   - `VITE_WALLET_CONNECT_PROJECT_ID` *(optional)* – WalletConnect V2 project ID (`demo` fallback).
   - `VITE_BACKEND_URL` – URL of the backend (`http://localhost:3001` when developing).
   - `VITE_FRONTEND_URL` – Public/preview URL of the frontend (use `http://localhost:5173` locally).

The React app validates these variables on startup. Missing or malformed values render a modal with guidance instead of mounting the wallet providers.

## Install & run
Open two terminals from `morpho/`:

1. **Backend**
   ```bash
   cd backend
   npm install
   npm run dev           # listens on http://localhost:3001 by default
   ```
   - `npm start` runs the same server without file watching.
   - Check health: `curl http://localhost:3001/health`.

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev -- --host # serves on http://localhost:5173
   ```
   - Use `npm run build` / `npm run preview` for production builds.
   - Tailwind styles live in `src/index.css` and component classes.

## Flow overview
1. The user clicks **OpenfortButton** to authenticate; Openfort fetches an encryption session by calling the backend route `POST /api/create-encryption-session`.
2. After connecting, hooks in `src/hooks` read the wallet's USDC balance and vault position via viem.
3. "Supply" approves the Morpho vault to spend USDC and deposits the full balance; "Withdraw" redeems all shares back to the wallet.
4. Vault APY is fetched from `https://blue-api.morpho.org/graphql` using the Morpho Blue SDK.

## Customisation tips
- Adjust the Base RPC endpoint in `frontend/src/lib/rpc.ts` (`SELECTED_BASE_MAINNET_RPC_URL`).
- Change the target vault address in `frontend/src/hooks/useVaultOperations.ts` & `useVaultApy.ts`.
- Extend the backend with caching, rate limiting, or authentication if exposing it publicly.

## Troubleshooting
- **Modal: "Configuration required"** – Ensure both `.env` files exist and restart the dev servers so Vite picks up changes.
- **`fetch` is not defined** – Upgrade to Node.js 18+ or add a polyfill (`node-fetch`) in `backend/server.js`.
- **Transactions stuck** – Try another Base RPC endpoint or increase retry delays in `useVaultOperations`.
- **CORS errors** – Confirm `FRONTEND_URL`/`CORS_ORIGIN` matches the Vite dev URL (including protocol & port).

With the backend and frontend running, openfort sessions will let you supply and withdraw USDC from the configured Morpho vault directly from the browser.
