# USDC Transfer Demo

A React Native Expo application demonstrating USDC token transfers using Openfort's embedded wallet infrastructure. This demo showcases wallet creation, faucet funding, and ERC-20 token transfers on Ethereum Sepolia testnet.

## Features

- 🔐 **Embedded Wallet Authentication** - Secure wallet creation and management via Openfort
- 🪙 **Dual Wallet System** - Create and manage two wallets for transfers
- 💰 **USDC Transfers** - Send USDC tokens between wallets with gas sponsorship
- 🚰 **Faucet Integration** - Get testnet USDC from Circle's faucet
- 📊 **Real-time Balance Updates** - Live balance polling and updates
- 🔄 **Wallet Switching** - Switch active wallet context seamlessly
- 🌐 **Multi-chain Support** - Base Sepolia and Ethereum Sepolia networks

## Architecture

### Core Components

- **`MainAppScreen`** - Primary interface for USDC transfers and wallet management
- **`CreateWalletsScreen`** - Onboarding flow for wallet creation
- **`FaucetScreen`** - Interface for requesting testnet USDC
- **`UserScreen`** - Main authenticated user interface

### Key Utilities

- **`utils/erc20.ts`** - ERC-20 token interactions (balance queries, transfers)
- **`utils/config.ts`** - Environment configuration management
- **`utils/format.ts`** - Number formatting for USDC display
- **`constants/erc20.ts`** - Contract addresses and signatures
- **`constants/network.ts`** - Blockchain network configurations

### Openfort Integration

The app uses the `@openfort/react-native` SDK with:
- **OpenfortProvider** - Root provider for wallet context
- **Gas Sponsorship** - Transactions sponsored via Ethereum Provider Policy
- **Shield Integration** - Secure key management and recovery
- **Multi-chain Support** - Ethereum Sepolia and Base Sepolia

## Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI
- iOS Simulator or Android Emulator
- Openfort Dashboard account

### Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Configure your Openfort credentials in `.env.local`:
   ```env
   OPENFORT_PROJECT_PUBLISHABLE_KEY=pk_test_your_publishable_key
   OPENFORT_SHIELD_PUBLISHABLE_KEY=pk_test_your_shield_key
   OPENFORT_SHIELD_RECOVERY_BASE_URL=https://your-recovery-api.com
   OPENFORT_ETHEREUM_PROVIDER_POLICY_ID=pol_your_policy_id
   ```

### Required Openfort Setup

1. **Create Project** - Set up a new project in [Openfort Dashboard](https://dashboard.openfort.io)
2. **Configure Gas Policy** - Create an Ethereum Provider Policy for gas sponsorship
3. **Shield Configuration** - Set up Shield for secure key management
4. **Recovery Service** - Deploy wallet recovery endpoints (optional)

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Platform-specific commands
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
```

## Usage Flow

### 1. Authentication
- Login via Openfort's authentication flow
- Supports social and email authentication

### 2. Wallet Creation
- Create two embedded wallets on Ethereum Sepolia
- Each wallet gets a unique address for testing transfers

### 3. Fund Wallets
- Use Circle's USDC faucet to get testnet tokens
- App provides direct links to faucet with wallet addresses

### 4. Transfer USDC
- Select active wallet using the switch function
- Enter transfer amount in USDC (6 decimal precision)
- Execute gasless transfers between wallets
- Real-time balance updates after transfers

## Technical Details

### Network Configuration

- **Primary Network**: Ethereum Sepolia (Chain ID: 11155111)
- **Secondary Network**: Base Sepolia (Chain ID: 84532)
- **USDC Contract**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` (Sepolia)

### ERC-20 Operations

The app implements standard ERC-20 interactions:
- **Balance Queries** - `balanceOf(address)` calls with timeout handling
- **Token Transfers** - `transfer(address,uint256)` via `wallet_sendCalls`
- **Decimal Handling** - 6-decimal USDC precision with safe BigInt math
- **Transaction Polling** - Automatic receipt confirmation

### Gas Sponsorship

All transactions are sponsored through Openfort's Ethereum Provider Policy:
- Users don't need ETH for gas fees
- Transactions are bundled and sponsored automatically
- Configurable via `OPENFORT_ETHEREUM_PROVIDER_POLICY_ID`

## Development

### Key Files Structure

```
usdc/my-app/
├── app/
│   ├── index.tsx           # Entry point
│   └── _layout.tsx         # Root layout with OpenfortProvider
├── components/
│   ├── MainAppScreen.tsx   # Transfer interface
│   ├── UserScreen.tsx      # Main authenticated screen
│   ├── LoginScreen.tsx     # Authentication
│   └── onboarding/         # Wallet creation flow
├── utils/
│   ├── erc20.ts           # ERC-20 token operations
│   ├── config.ts          # Environment config
│   └── format.ts          # Number formatting
├── constants/
│   ├── erc20.ts           # Token constants
│   └── network.ts         # Network configurations
└── types/
    └── wallet.ts          # TypeScript definitions
```

### Testing

The app is designed for testnet use only:
- Uses Circle's Sepolia USDC faucet
- All transactions on Ethereum Sepolia testnet
- No mainnet configurations included

## Troubleshooting

### Common Issues

- **Balance not loading** - Check network connectivity and RPC endpoints
- **Transfer fails** - Ensure sufficient USDC balance and gas policy is active
- **Wallet creation errors** - Verify Openfort API keys and project configuration
- **Faucet issues** - Use Circle's official USDC faucet for Sepolia

### Debug Mode

Enable verbose logging in `app/_layout.tsx`:
```tsx
<OpenfortProvider
  verbose={true}
  // ... other props
>
```

## Resources

- [Openfort Documentation](https://docs.openfort.io/)
- [Circle USDC Faucet](https://faucet.circle.com/)
- [Ethereum Sepolia Testnet](https://sepolia.etherscan.io/)
- [React Native Expo](https://expo.dev/)