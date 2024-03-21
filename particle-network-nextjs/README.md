<div align="center">
  <a href="https://particle.network/">
    <img src="https://i.imgur.com/xmdzXU4.png" />
  </a>
  <h3>
    Particle Openfort Demo
  </h3>
</div>

⚡️ Demo application showcasing the utilization of Openfort session keys & player accounts in tandem with authentication/wallet creation through [Particle Auth](https://docs.particle.network/developers/auth-service). Specifically, this application facilitates the creation of a wallet/identity with Particle, which is then used to create an Openfort player, upon which a session key can be generated to test within a **gasless** and **popupless** NFT mint.

Built using **Particle Auth**, **Openfort**, **Typescript**, and **Ethers**.

## 🔑 Particle Auth
Particle Auth, a component of Particle Network's Wallet-as-a-Service, enables seamless onboarding to an application-embedded MPC-TSS/AA wallet facilitated by social login, such as Google, GitHub, email, phone number, etc.

👉 Try the demo: https://web-demo.particle.network

👉 Learn more about Particle Network: https://particle.network

![Particle Auth Example](https://i.imgur.com/dGaV3jF.png)

## 🛠️ Quickstart

### Clone this repository
```
git clone https://github.com/TABASCOatw/particle-openfort-demo.git
```

### Install dependencies
```
yarn install
```
OR
```
npm install
```

### Set environment variables
This project requires a number of keys from Particle Network and WalletConnect to be defined in `.env`. The following should be defined:
- `NEXT_PUBLIC_APP_ID`, the ID of the corresponding application in your [Particle Network dashboard](https://dashboard.particle.network/#/applications).
- `NEXT_PUBLIC_PROJECT_ID`, the ID of the corresponding project in your [Particle Network dashboard](https://dashboard.particle.network/#/applications).
-  `NEXT_PUBLIC_CLIENT_KEY`, the client key of the corresponding project in your [Particle Network dashboard](https://dashboard.particle.network/#/applications).
-  `NEXTAUTH_OPENFORT_SECRET_KEY`, the secret API key of your Openfort project found in the [Openfort dashboard](https://dashboard.openfort.xyz/)
-  `NEXTAUTH_OPENFORT_CONTRACT`, the contract ID of a whitelisted/specified contract within the [Openfort dashboard](https://dashboard.openfort.xyz/)
-  `NEXTAUTH_OPENFORT_POLICY`, the policy ID of a gas policy created within the [Openfort dashboard](https://dashboard.openfort.xyz/)
-  `NEXT_PUBLIC_OPENFORT_PUBLIC_KEY`, the publishable (public) API key corresponding with a project created within the [Openfort dashboard](https://dashboard.openfort.xyz/)
-  `PARTICLE_SECRET_PROJECT_ID`, the server key of your Particle project created through the [Particle Network dashboard](https://dashboard.particle.network/#/applications)

### Start the project
```
npm run dev
```
OR
```
yarn dev
```

##
Originally featured in "[Utilizing Session Keys with Particle WaaS and Openfort](https://twitter.com/TABASCOweb3/status/1713146824511684855)"

##
This repository was originally derived from an example outlined within [this demo](https://github.com/openfort-xyz/samples/tree/main/particle-network-nextjs).