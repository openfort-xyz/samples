![Group 48095760](https://github.com/user-attachments/assets/ce49cf85-7e38-4ff5-9ff0-05042667a3d8)

# Openfort Samples

This repository contains comprehensive samples demonstrating how to integrate Openfort's embedded wallet infrastructure with popular DeFi protocols and blockchain applications. Each sample showcases different use cases and implementation patterns for building Web3 applications.

## 📁 Sample Projects

### 🏛️ [Aave Integration](./aave/)
**Languages:** TypeScript, React, Node.js
**Stack:** Vite + React frontend, Express.js backend
**Purpose:** Demonstrates DeFi lending and borrowing operations using Openfort embedded wallets with the Aave protocol. Shows how to interact with lending pools, manage collateral, and execute DeFi transactions with gas sponsorship.

**Key Features:**
- Aave protocol integration for lending/borrowing
- React + Vite frontend with Tailwind CSS
- Express.js backend for Shield encryption sessions
- CORS-enabled API for wallet operations
- Multi-language support (Catalan documentation)

### 📈 [Hyperliquid Trading](./hyperliquid/)
**Languages:** TypeScript, React Native
**Stack:** Expo React Native
**Purpose:** Mobile trading application for Hyperliquid's decentralized exchange. Demonstrates how to combine Openfort's embedded wallets with perpetual trading, real-time price feeds, and order management.

**Key Features:**
- Real-time HYPE/USDC price feeds with charts
- Market buy/sell order placement
- Testnet trading with 1000 mock USDC
- Balance tracking across wallet and exchange
- Mobile-optimized trading interface
- Integration with Hyperliquid's official SDK

### 🔄 [Morpho Blue Vault](./morpho/)
**Languages:** TypeScript, React, Node.js
**Stack:** Vite + React frontend, Express.js backend
**Purpose:** Web application for interacting with Morpho Blue lending vaults on Base. Shows vault supply/withdrawal operations with yield optimization strategies.

**Key Features:**
- Morpho Blue vault interactions on Base mainnet
- USDC supply and withdrawal operations
- GraphQL integration for vault APY data
- Real-time balance and position tracking
- Wagmi + Viem for blockchain interactions
- Shield encryption session management

### 💸 [USDC Transfer Demo](./usdc-transfer/)
**Languages:** TypeScript, React Native
**Stack:** Expo React Native
**Purpose:** Mobile application demonstrating basic ERC-20 token transfers using Openfort's embedded wallet infrastructure. Perfect for understanding wallet creation, faucet integration, and gasless transactions.

**Key Features:**
- Dual wallet system for testing transfers
- Circle USDC faucet integration
- Real-time balance updates with polling
- Gasless transactions via Ethereum Provider Policy
- Multi-chain support (Ethereum Sepolia, Base Sepolia)
- ERC-20 token operations with 6-decimal precision

## 🚀 Getting Started

Each sample is completely self-contained with its own setup instructions, environment configuration, and dependencies. Navigate to any sample directory and follow the `README.md` for detailed setup instructions.

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **Openfort Dashboard Account** with configured API keys
- **Platform-specific tools:**
  - For mobile samples: Expo CLI, iOS Simulator/Android Emulator
  - For web samples: Modern web browser

### Common Setup Pattern
1. **Environment Configuration** - Copy `.env.example` to `.env.local` and configure Openfort credentials
2. **Install Dependencies** - Run `npm install` in respective directories
3. **Start Development** - Use `npm run dev` for web or `npm start` for mobile
4. **Configure Openfort Dashboard** - Set up gas policies, Shield keys, and recovery endpoints

## 🔧 Technology Stack Overview

| Sample | Frontend | Backend | Blockchain | Key Libraries |
|--------|----------|---------|------------|---------------|
| **Aave** | React + Vite | Express.js | Ethereum | `@aave/react`, `wagmi`, `viem` |
| **Hyperliquid** | React Native | - | Arbitrum Sepolia | `@nktkas/hyperliquid`, `@openfort/react-native` |
| **Morpho** | React + Vite | Express.js | Base | `wagmi`, `viem`, `graphql-request` |
| **USDC Transfer** | React Native | - | Ethereum Sepolia | `@openfort/react-native`, `expo` |

## 📚 What You'll Learn

- **Embedded Wallet Integration** - How to integrate Openfort's wallet infrastructure
- **DeFi Protocol Interactions** - Working with Aave, Morpho, and DEX protocols
- **Gas Sponsorship** - Implementing gasless transactions for better UX
- **Multi-chain Development** - Supporting multiple networks and tokens
- **Mobile Web3** - Building React Native apps with blockchain functionality
- **Real-time Data** - Polling balances, prices, and transaction states
- **Security Best Practices** - Shield encryption and secure key management

## 🌐 Supported Networks

- **Ethereum Sepolia** (Testnet)
- **Base Sepolia** (Testnet)
- **Base Mainnet**
- **Arbitrum Sepolia** (Testnet)
- **Hyperliquid Testnet**

## 💡 Use Cases Demonstrated

1. **DeFi Lending** (Aave) - Supply, borrow, and manage collateral
2. **Perpetual Trading** (Hyperliquid) - Place orders and manage positions
3. **Yield Farming** (Morpho) - Optimize yields through lending vaults
4. **Token Transfers** (USDC) - Basic wallet operations and ERC-20 handling

## 🔗 External Resources

- [Openfort Documentation](https://docs.openfort.io/)
- [Openfort Dashboard](https://dashboard.openfort.io/)
- [Aave Documentation](https://docs.aave.com/)
- [Hyperliquid Documentation](https://hyperliquid.gitbook.io/)
- [Morpho Documentation](https://docs.morpho.org/)

---

Each sample includes comprehensive error handling, development best practices, and production-ready patterns. Start with the **USDC Transfer** sample for basic wallet operations, then progress to the DeFi samples for more advanced integrations.