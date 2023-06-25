# Popup-less minting with Openfort

This sample shows you how to integrate with Openfort [session keys](https://www.openfort.xyz/docs/session-keys).

Interacting with injected wallets is a UX challenge. This sample shows you how to use Openfort session keys to mint tokens without a pop-up.

## Demo
- [Live demo video](https://youtu.be/rh2E02PATlU)

This demo authenticates a player using NextAuth. It assumes that there exists a database where the relation betweeen an address and an Openfort player is created.


## Features

- 🌍 Built-in support for [RainbowKit](https://www.rainbowkit.com/).
- 🍎⌚️ Built-in support for [Wagmi](https://wagmi.sh/).
- 🔒 Built-in support for [SIWE](https://login.xyz/).
- 🍨 Next.JS as ⚛️ React client framework with NextAuth for authentication.
- 🏰 Openfort Session Keys.


## How to run locally

**1. Clone and configure the sample**

```
git clone https://github.com/openfort-xyz/samples
cd rainbow-ssv-nextjs
```

Copy the .env.local.example file into a file named .env.local in the folder of the server you want to use. For example:

```
cp .env.local.example .env.local
```

You will need an Openfort account in order to run the demo. Once you set up your account, go to the Openfort [developer dashboard](https://dashboard.openfort.xyz/apikeys) to find your API keys.

```
NEXT_PUBLIC_OPENFORT_PUBLIC_KEY=<replace-with-your-publishable-key>
NEXTAUTH_OPENFORT_SECRET_KEY=<replace-with-your-secret-key>
```

The other environment variables are configurable:

`NEXTAUTH_SECRET` is a secret used for signing cookies. It can be any random string.

`NEXTAUTH_URL` is the URL of the server. By default, it is set to `http://localhost:3000` and does not need to be modified unless you change the port number or host name.

`NEXT_PUBLIC_ENABLE_TESTNETS` is a boolean that enables the use of testnets.

**2. Create a Player, Policy and Contract**

[![Required](https://img.shields.io/badge/REQUIRED-TRUE-ORANGE.svg)](https://shields.io/)

You can create Policies and add Contracts in the Dashboard or with the API. This sample requires a Policy and a Contract to run. Once you've created them, and add its ID to your `.env`.

`NEXTAUTH_OPENFORT_PLAYER` is the ID of a [Player](https://www.openfort.xyz/docs/api/players#create-a-player) for your player. 

`NEXTAUTH_OPENFORT_CONTRACT` is the ID of a [Contract](https://www.openfort.xyz/docs/api/contracts#create-a-contract) for your contract. A contract has a chain_id. 
If you need a test contract address, use 0x38090d1636069c0ff1Af6bc1737Fb996B7f63AC0 (NFT contract deployed in 80001 Mumbai).

`NEXTAUTH_OPENFORT_POLICY` is the ID of a [Policy](https://www.openfort.xyz/docs/api/policies#create-a-policy) for your contract. A policy has a contract and chain_id. For this demo to work, the policy must have both the contract and the register sessions as rules.


**3. Follow the server instructions on how to run**

Install & Run:

```bash
npm install
npm run dev
# or
yarn
yarn dev
```


## Get support
If you found a bug or want to suggest a new [feature/use case/sample], please [file an issue](../../../issues).

If you have questions, comments, or need help with code, we're here to help:
- on [Discord](https://discord.com/invite/t7x7hwkJF4)
- on Twitter at [@openfortxyz](https://twitter.com/StripeDev)
- by [email](mailto:support+github@openfort.xyz)
