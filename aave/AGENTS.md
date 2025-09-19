# AGENTS.md

## Project overview
- Openfort + Aave integration with a Vite React frontend and Express backend.
- Uses Shield to manage embedded wallets and sponsored lending transactions.

## Setup commands
- `cd backend && npm install`
- `cd backend && cp .env.example .env`
- `cd frontend && npm install`
- `cd frontend && cp .env.example .env`
- `cd backend && npm run dev` (starts API on `http://localhost:3001`)
- `cd frontend && npm run dev` (serves UI on `http://localhost:5173`)

## Environment
- Backend `.env` must define `NEXT_PUBLIC_SHIELD_API_KEY`, `NEXTAUTH_SHIELD_SECRET_KEY`, `NEXTAUTH_SHIELD_ENCRYPTION_SHARE`, `FRONTEND_URL`, and `BACKEND_URL`.
- Frontend `.env` must define `VITE_OPENFORT_PUBLISHABLE_KEY`, `VITE_OPENFORT_SHIELD_PUBLIC_KEY`, `VITE_OPENFORT_POLICY_ID`, and `VITE_BACKEND_URL`.
- Keep the policy ID and Shield credentials synced across backend and frontend when rotating keys.

## Testing instructions
- `cd frontend && npm run lint` (TypeScript + ESLint checks)
- Manually hit `http://localhost:3001/api/session` to confirm Shield configuration before UI testing.
- Exercise the deposit/borrow flows end-to-end after changing policy IDs or contract addresses.

## Code style
- Frontend follows Vite + TypeScript defaults with ESLint (`eslint .`).
- Prefer functional React components and hooks; keep wallet state in React Query where possible.
- Backend is Node 18+ Express with standard Prettier-style formatting (no enforced lint step).

## PR instructions
- Title format: `[aave] <summary>`.
- Run the lint command above and verify backend bootstraps cleanly before requesting review.
- Document new env vars or contract addresses in `aave/README.md` when they change.
