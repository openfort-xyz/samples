# AGENTS.md

## Project overview
- Openfort + Morpho integration with separate Express backend and Vite React frontend.
- Demonstrates lending flows with Shield-managed embedded wallets and optional WalletConnect support.

## Setup commands
- `cd backend && npm install`
- `cd backend && cp .env.example .env`
- `cd frontend && npm install`
- `cd frontend && cp .env.example .env`
- `cd backend && npm run dev`
- `cd frontend && npm run dev`

## Environment
- Backend `.env` needs `NEXT_PUBLIC_SHIELD_API_KEY`, `NEXTAUTH_SHIELD_SECRET_KEY`, `NEXTAUTH_SHIELD_ENCRYPTION_SHARE`, `PORT`, `CORS_ORIGIN`, `FRONTEND_URL`, and `BACKEND_URL`.
- Frontend `.env` needs `VITE_OPENFORT_PUBLISHABLE_KEY`, `VITE_OPENFORT_POLICY_ID`, `VITE_OPENFORT_SHIELD_PUBLIC_KEY`, `VITE_WALLET_CONNECT_PROJECT_ID`, `VITE_BACKEND_URL`, and `VITE_FRONTEND_URL`.
- Update both env files whenever rotating Shield credentials or changing Morpho market endpoints.

## Testing instructions
- `cd frontend && npm run lint`
- Manually validate deposit, borrow, repay, and account display flows after changing API or policy settings.
- Ensure the backend starts cleanly with populated Shield credentials prior to UI testing.

## Code style
- Frontend uses Vite + TypeScript; follow existing Tailwind + hooks patterns.
- Backend follows standard Express style with async route handlers; keep logging minimal.

## PR instructions
- Title format: `[morpho] <summary>`.
- Ensure backend starts cleanly and frontend lint passes before requesting review.
- Reflect any new env requirements or market constants in `morpho/README.md`.
