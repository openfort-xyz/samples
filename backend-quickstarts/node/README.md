# Checkout single subscription
An [Express server](http://expressjs.com) implementation

## Requirements
* Node v10+
* [Configured .env file](../README.md)

## How to run locally

**1. Clone and configure the sample**

Copy the .env.example file into a file named .env in the folder of the server you want to use. For example:

```
cp .env.example .env
```

You will need an Openfort account in order to run the demo. Once you set up your account, go to the Openfort [developer dashboard](https://dashboard.openfort.xyz/apikeys) to find your API keys.

```
NEXT_PUBLIC_OPENFORT_PUBLIC_KEY=<replace-with-your-publishable-key>
NEXTAUTH_OPENFORT_SECRET_KEY=<replace-with-your-secret-key>
```

**2. Create a Policy and add a Contract**

[![Required](https://img.shields.io/badge/REQUIRED-TRUE-ORANGE.svg)](https://shields.io/)

You can create Policies and add Contracts in the Dashboard or with the API. This sample requires a Policy and a Contract to run. 

The ID of a [Contract](https://www.openfort.xyz/docs/reference/api/create-contract-object) for your imported smart contract.
If you need a test contract address, use 0x38090d1636069c0ff1Af6bc1737Fb996B7f63AC0 (NFT contract deployed in 80001 Mumbai).

`policyId` is the ID of a [Policy](https://www.openfort.xyz/docs/reference/api/create-a-policy-object) to sponsor gas interactions with the NFT contract. A policy has a contract and chainId. For this demo to work, the policy must have both the contract and the register sessions as rules.

**3. Run locally**

```sh
npm start
```

Go to `localhost:4242` to see the demo

## Get support

If you have questions, comments, or need help with code, we're here to help:
- on [Discord](https://discord.com/invite/t7x7hwkJF4)
- on Twitter at [@openfortxyz](https://twitter.com/openfortxyz)
- by [email](mailto:support+github@openfort.xyz)
