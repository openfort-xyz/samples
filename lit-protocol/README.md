# Programmable MPC Wallets with Lit Protocol

This is an example web app that shows how you can use Lit's programmable MPC signer with social accounts, one-time passwords, and passkeys using [Lit JS SDK](https://developer.litprotocol.com/v2/).

- [Live demo](https://sample-lit-protocol-nextjs.vercel.app)

## How to run locally

**1. Clone and configure the sample**

```bash
git clone https://github.com/openfort-xyz/samples/tree/main/lit-protocol

cd lit-protocol

npm install
```

Copy the .env.local.example file into a file named .env.local in the folder of the server you want to use. For example:

```
cp .env.local.example .env.local
```

You will need an Openfort account in order to run the demo. Once you set up your account, go to the Openfort [developer dashboard](https://dashboard.openfort.xyz/apikeys) to find your API keys.

```bash .env.local
NEXT_PUBLIC_OPENFORT_PUBLIC_KEY="<replace with your publishable key>"
NEXTAUTH_OPENFORT_SECRET_KEY="<replace with your secret key>"
```

**1.1. Add your social onboarding:**

we're using [Stytch](https://stytch.com) project's `project_id` and `public_token` to `.env.local`:

If you're not using Stytch, feel free to comment out the Stytch provider `StytchProvider` and Stytch component `StytchOTP`.

```bash .env.local
NEXT_PUBLIC_STYTCH_PROJECT_ID="<Your Stytch Project ID>"
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN="<Your Stytch Public Token>"
```

**2. Create a Policy and Contract**

[![Required](https://img.shields.io/badge/REQUIRED-TRUE-ORANGE.svg)](https://shields.io/)

You can create Policies and add Contracts in the Dashboard or with the API. This sample requires a Policy and a Contract to run. Once you've created them, head to the folder `api` inside `pages` and edit the contract and policy constants in `collect-assets.ts`.


`contract` is the ID of a [Contract](https://www.openfort.xyz/docs/reference/api/create-contract-object) for your contract. A contract has a chainId. 
If you need a test contract address, use 0x38090d1636069c0ff1Af6bc1737Fb996B7f63AC0 (NFT contract deployed in 80001 Polygon Mumbai).

`policy` is the ID of a [Policy](https://www.openfort.xyz/docs/reference/api/create-a-policy-object) for your contract. A policy has a contract and chainId. For this demo to work, the policy must have both the contract and the register sessions as rules.


**3. Start your development server:**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start playing with the app.

## Get support
If you found a bug or want to suggest a new [feature/use case/sample], please [file an issue](../../../issues).

If you have questions, comments, or need help with code, we're here to help:
- on [Discord](https://discord.com/invite/t7x7hwkJF4)
- on Twitter at [@openfortxyz](https://twitter.com/openfortxyz)
- by [email](mailto:support+github@openfort.xyz)
