# Create a Gaming Ecosystem with Openfort

This is an example application that shows how you can create your own gaming ecosystem with Openfort.

![gaming-ecosystem.svg](https://blog-cms.openfort.xyz/uploads/gaming_ecosystem_diagram_64758d2d96.svg)


## Demo
- [Live demo video]()




## Features

**Ecosystem backend**
- [Express](https://expressjs.com/) as the web server framework.
- [TypeScript](https://www.typescriptlang.org/) for type checking.
- [Prisma](https://www.prisma.io/) as the database toolkit.
- [PostgreSQL](https://www.postgresql.org/) as the database.
- [Passport](https://www.passportjs.org/) as the authentication middleware.
- [Openfort](https://www.openfort.xyz/) as the web3 account management solution.

**OAuth provider frontend**
- 🍨 [Next.JS](https://nextjs.org/) as ⚛️ React client framework.


**Sample OAuth integration**
- 🍨 [Next.JS](https://nextjs.org/) as ⚛️ React client framework.

## Authentication patterns

Depending on your games needs, here's a few possible patterns you may choose to integrate your auth page through.

**Redirect Pattern**

Redirect patterns are common for web-based games or UI's where your players need to be redirected to some page on your game's website, or perhaps a settings page on the web for your game.

Setting the redirect_uri, your game may choose to link the "Register" or "Login" button from your game's website to the Ecosystem auth flow page. From there, your player would be able to login or register. After successfully logging in or registering, the player would be redirected to the redirectUri you set in the auth page's query parameters.

This redirect uri will have the authenticated player's jwtToken and player. For example, a redirect uri may be https://mygame.com/game and the resulting redirect will become https://mygame.com/game#token=PLAYER_ACCESS_TOKEN&player=PLAYER_ID. From here, your game's webpage logic can grab the player jwtToken and player from the fragment (#) url parameters and perform any final login/authentication logic needed for your game.

**Embed Pattern**

The embed pattern is intended for mobile apps, native games, or any non-web implementations.

For example, you may choose to build a mobile app or desktop game and use our auth page for login or registration.

You can use the embed pattern by excluding the redirect_uri from the auth page's query parameters. This allows you to do an in-app or in-game web browser/modal window that opens your Ecosystem auth page. Your player would complete the specified flow (login or registration) and once finished the player's jwtToken and player will be set and update the auth page's URL.

You can use a url change listener for your in-app or in-game browser modal and wait for the #jwtToken=, &player= fragment properties to be set on the url. Once set, you can extract the player's jwtToken and player and perform any additional auth logic for your game from there and automatically close the browser modal/pop-up.

## How to run locally

**1. Clone and configure the sample**

```
git clone https://github.com/openfort-xyz/samples
cd oauth-game-ecosystem
```

You will then find 3 folders:
- `ecosystem-backend`: The backend of the ecosystem.
- `oauth-provider-frontend`: The frontend of the OAuth provider.
- `sample-oauth-integration`: The frontend of the sample OAuth integration.

You will need to run the independently.
For each of them, you will need to `cd` into the folder and run `npm install` or `yarn` to install the dependencies. then copy the .env.example file into a file named .env in the folder of the server you want to use. For example:

```
cp .env.example .env
```

You will need an Openfort account in order to run the demo. Once you set up your account, go to the Openfort [developer dashboard](https://dashboard.openfort.xyz/apikeys) to find your API keys.

```
OPENFORT_SECRET_KEY=<replace-with-your-secret-key>
```

**2. Configure Authentication Providers**

If you want to use Google OAuth2 for authentication, you will need to create a project in the [Google Developer Console](https://console.developers.google.com/) and create an OAuth Client ID. See [a guide](https://developers.google.com/workspace/guides/create-credentials). You will need to add the following environment variables to your `.env` file:

In the `ecosystem-backend`:
```
GOOGLE_CLIENT_SECRET
GOOGLE_CLIENT_ID
```

In `oauth-provider-frontend`:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

**2.1. Database**
Prisma is used to connect to a database. You can use any of the [supported databases](https://www.prisma.io/docs/concepts/components/prisma-schema/datasources/supported-databases) with Prisma. You will need to add the following environment variables to your `.env` file in the `ecosystem-backend`:

```
DATABASE_URL
```

Bear in mind, the first time you run the sample, it will create the database schema automatically for you using the Prisma Migrate feature. When in `ecosystem-backend`, run:

```bash
yarn db:migrate
```

**3. Create a Policy and a Contract**

[![Required](https://img.shields.io/badge/REQUIRED-TRUE-ORANGE.svg)](https://shields.io/)

You can create Policies and add Contracts in the Dashboard or with the API. This sample requires a Policy and a Contract to run. Once you've created them, and add its ID to your `.env`.

`contract_id` is the ID of a [Contract](https://www.openfort.xyz/docs/api/contracts#create-a-contract) for your contract. A contract has a chain_id. 
If you need a test contract address, use 0x38090d1636069c0ff1Af6bc1737Fb996B7f63AC0 (NFT contract deployed in 80001 Mumbai).

`policy_id` is the ID of a [Policy](https://www.openfort.xyz/docs/api/policies#create-a-policy) for your contract. A policy has a contract and chain_id. For this demo to work, the policy must have both the contract and the register sessions as rules.


**4. Follow the server instructions on how to run**
In each of the three folders Install & Run:

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



