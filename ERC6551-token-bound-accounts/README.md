# Token Bound Accounts

This samples shows your how to use [ERC-6551](https://eips.ethereum.org/EIPS/eip-6551) Token Bound Accounts with Openfort.

- [Blog article](https://www.openfort.xyz/blog/technical-dive-combining-token-bound-account-tba-with-account-abstraction-aa).
- [Implementation guide](https://www.openfort.xyz/docs/guides/accounts/token-bound-accounts).

It includes two options:

## Option 1
An upgradeable Openfort account owns the NFT that owns the 6551 account
![Option 1](https://blog-cms.openfort.xyz/uploads/Group_348_05b11271b9.svg)

## Option 2
An EAO owns the NFT that owns the 6551 account.
![Option 2](https://blog-cms.openfort.xyz/uploads/Group_349_48e9e86864.svg)

## How to run locally

**1. Clone and configure the sample**

```
git clone https://github.com/openfort-xyz/samples
cd ERC6551-token-bound-accounts
```

You will need an Openfort account in order to run the demo. 
Once you set up your account, go to the Openfort [developer dashboard](https://dashboard.openfort.xyz/apikeys) to find your API keys.

```
OPENFORT_SECRET_KEY=<replace-with-your-secret-key>
```

**2. Follow the server instructions on how to run**

In the end of the file `index.ts` you can decide to run the server with option 1 or option 2.

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
