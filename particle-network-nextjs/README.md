# Particle Network with Openfort

This sample uses Particle Network as the key management and authentication solution.

It uses Server-Side Verification (SSV) via Social login to authenticate a player. It will create a self-custodial account for the player and collect an asset with it.


## Demo

- [Live demo](https://sample-particle-network-nextjs.vercel.app/)

This demo authenticates a player using NextAuth. It will create a smart contract wallet where the private key and the user authentication is managed by Particle Network.


## Features

- 🍨 Next.JS as ⚛️ React client framework with NextAuth for authentication.
- 3️⃣ Particle Network as the key management and authentication solution.
- 🏰 Openfort Session Keys.

## How to run locally

**1. Clone and configure the sample**

```
git clone https://github.com/openfort-xyz/samples
cd particle-network-nextjs
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

`NEXT_PUBLIC_PROJECT_ID`,`NEXT_PUBLIC_CLIENT_KEY`,`NEXT_PUBLIC_APP_ID` is the client_id from Particle. You can get it from https://dashboard.particle.network/

**2. Create a Policy and Contract**

[![Required](https://img.shields.io/badge/REQUIRED-TRUE-ORANGE.svg)](https://shields.io/)

You can create Policies and add Contracts in the Dashboard or with the API. This sample requires a Policy and a Contract to run. Once you've created them, and add its ID to your `.env`.

`NEXTAUTH_OPENFORT_CONTRACT` is the ID of a [Contract](https://www.openfort.xyz/docs/reference/api/create-contract-object) for your contract. A contract has a chainId. 
If you need a test contract address, use 0x38090d1636069c0ff1Af6bc1737Fb996B7f63AC0 (NFT contract deployed in 80001 Mumbai).

`NEXTAUTH_OPENFORT_POLICY` is the ID of a [Policy](https://www.openfort.xyz/docs/reference/api/create-a-policy-object) for your contract. A policy has a contract and chainId. For this demo to work, the policy must have both the contract and the register sessions as rules.


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
- on Twitter at [@openfortxyz](https://twitter.com/openfortxyz)
- by [email](mailto:support+github@openfort.xyz)
