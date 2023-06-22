# External KMS to sign transaction intents

Players can decide whether they want to use custodial accounts (Openfort protecting their private keys in a managed KMS) or non-custodial accounts (manage and store their own private keys).
In the cases where users use non-custodial accounts, they may use an external KMS to securely store the private keys. This sample shows you how to sign Openfort's transaction intents using your own KMS system.

## Demo
[Live demo video](https://www.youtube.com/watch?v=uHigZXdTECw)

## Features

- [Express](https://expressjs.com/) as the web server framework.
- [TypeScript](https://www.typescriptlang.org/) for type checking.
- 🏰 Openfort

## How to run locally

**1. Clone and configure the sample**

```
git clone https://github.com/openfort-xyz/samples
cd external-kms-game
```

Copy the .env.example file into a file named .env in the folder of the server you want to use. For example:

```
cp .env.example .env
```

You will need an Openfort account in order to run the demo. Once you set up your account, go to the Openfort [developer dashboard](https://dashboard.openfort.xyz/apikeys) to find your API keys.

```
OPENFORT_SECRET_KEY=<replace-with-your-secret-key>
OPENFORT_PUBLIC_KEY=<replace-with-your-publishable-key>
```

**2. Create a Player, Policy and Contract**

[![Required](https://img.shields.io/badge/REQUIRED-TRUE-ORANGE.svg)](https://shields.io/)

You can create Policies and add Contracts in the Dashboard or with the API. This sample requires a Policy and a Contract to run. Once you've created them, and add its ID to your `.env`.

`OPENFORT_PLAYER` is the ID of a [Player](https://www.openfort.xyz/docs/api/players#create-a-player) for your player. 

`OPENFORT_CONTRACT` is the ID of a [Contract](https://www.openfort.xyz/docs/api/contracts#create-a-contract) for your contract. A contract has a chain_id. 
If you need a test contract address, use 0x38090d1636069c0ff1Af6bc1737Fb996B7f63AC0 (NFT contract deployed in 80001 Mumbai).

`OPENFORT_POLICY` is the ID of a [Policy](https://www.openfort.xyz/docs/api/policies#create-a-policy) for your contract. A policy has a contract and chain_id. For this demo to work, the policy must have both the contract and the register sessions as rules.


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
