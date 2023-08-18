# Web3Auth MPC working with Openfort (Beta) Sample

This sample demonstrates how to use Web3Auth's tKey MPC Beta with Openfort in a React environment

## Features

- Web3Auth tKey MPC SDK.
- 🏰 Openfort.

## How to run locally

**1. Clone and configure the sample**

```
git clone https://github.com/openfort-xyz/samples
cd web3auth-tKey-mpc
```

Copy the .env.example file into a file named .env in the folder of the server you want to use. For example:

```
cp .env.example .env
```

You will need an Openfort account in order to run the demo. Once you set up your account, go to the Openfort [developer dashboard](https://dashboard.openfort.xyz/apikeys) to find your API keys.

```
REACT_APP_OPENFORT_PUBLIC_KEY=<replace-with-your-publishable-key>
REACT_APP_OPENFORT_SECRET_KEY=<replace-with-your-secret-key>
```

The other environment variables are configurable:

**2. Create a Player, Policy and Contract**

[![Required](https://img.shields.io/badge/REQUIRED-TRUE-ORANGE.svg)](https://shields.io/)

You can create Policies and add Contracts in the Dashboard or with the API. This sample requires a Policy and a Contract to run. Once you've created them, and add its ID to your `.env`.

`REACT_APP_OPENFORT_CONTRACT` is the ID of a [Contract](https://www.openfort.xyz/docs/api/contracts#create-a-contract) for your contract. A contract has a chainId. 
If you need a test contract address, use 0x38090d1636069c0ff1Af6bc1737Fb996B7f63AC0 (NFT contract deployed in 80001 Mumbai).

`REACT_APP_OPENFORT_POLICY` is the ID of a [Policy](https://www.openfort.xyz/docs/api/policies#create-a-policy) for your contract. A policy has a contract and chainId. For this demo to work, the policy must have both the contract and the register sessions as rules.

`REACT_APP_OPENFORT_PLAYER` is the ID of youre [Player](https://www.openfort.xyz/docs/api/policies#create-a-player).


**3. Follow the server instructions on how to run**

Install & Run:

```bash
cd w3a-tkey-mpc-popup-example
npm install
npm run start
# or
cd w3a-tkey-mpc-popup-example
yarn
yarn start
```

## Get support
If you found a bug or want to suggest a new [feature/use case/sample], please [file an issue](../../../issues).

If you have questions, comments, or need help with code, we're here to help:
- on [Discord](https://discord.com/invite/t7x7hwkJF4)
- on Twitter at [@openfortxyz](https://twitter.com/openfortxyz)
- by [email](mailto:support+github@openfort.xyz)
