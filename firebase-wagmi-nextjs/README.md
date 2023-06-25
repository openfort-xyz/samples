# Firebase Auth, Firestore with Wagmi and Openfort

This sample shows you how to use Firebase auth and firestore with Openfort.

It supports both login with all regular auth providers and with the wallet of the user.

## Features

- 🚀 NextJS, FirebaseAuth & Tailwindcss with Typescript
- 📝 Written with TypeScript
- 🔒 Client-side authentication sample with Credentials/Google Signin
- 🔒 Server-side authentication with cookies sample
- 🦚 with Tailwindcss layout
- Wagmi as React Hooks for Ethereum
- 🏰 Openfort Session Keys

## How to run locally

**1. Clone and configure the sample**

```
git clone https://github.com/openfort-xyz/samples
cd firebase-wagmi-nextjs
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

**2. Create a Policy and add a Contract**

[![Required](https://img.shields.io/badge/REQUIRED-TRUE-ORANGE.svg)](https://shields.io/)

You can create Policies and add Contracts in the Dashboard or with the API. This sample requires a Policy and a Contract to run. Once you've created them, and add its ID tor `.env`.

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


## Firebase Config

Firebase config: Console > Project settings > General.

Firebase-Admin config: Console > Project settings > Service accounts.

Update `.env`

```bash
#Firebase-admin
type=
project_id=
private_key_id=
private_key=
client_email=
client_id=
auth_uri=
token_uri=
auth_provider_x509_cert_url=
client_x509_cert_url=

#firebase
NEXT_PUBLIC_apiKey=
NEXT_PUBLIC_authDomain=
NEXT_PUBLIC_projectId=
NEXT_PUBLIC_storageBucket=
NEXT_PUBLIC_messagingSenderId=
NEXT_PUBLIC_appId=
```

## Get support
If you found a bug or want to suggest a new [feature/use case/sample], please [file an issue](../../../issues).

If you have questions, comments, or need help with code, we're here to help:
- on [Discord](https://discord.com/invite/t7x7hwkJF4)
- on Twitter at [@openfortxyz](https://twitter.com/StripeDev)
- by [email](mailto:support+github@openfort.xyz)