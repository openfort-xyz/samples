# Demo Passkey Smart Wallet - Turnkey <> Openfort

This repo contains a smart wallet application **for demonstration purposes only** showing how users can be registered and authenticated with [passkeys](https://www.passkeys.io/). Passkey signatures are used for registration and authentication. The backend component forwards signatures to [Turnkey](https://turnkey.com) and [Openfort](https://openfort.xyz).

Turnkey's infra is based on secure enclaves. Critically, Turnkey's infra ensures that no party, not [even Turnkey itself](https://docs.turnkey.com/security/non-custodial-key-mgmt#turnkeys-non-custodial-infrastructure), can access the user's private key without the proper credential -- which in this case is the user's passkey.

In other words, we are not actually using the passkeys themselves to sign transactions. Rather, we are using the passkeys to unlock ECDSA private keys, and then use the ECDSA private keys to sign transactions. By doing so, we achieve maximal compatibility with existing wallet infra as well gas efficiency, with the caveat that we are relying on a centralized signing service (Turnkey).

The Demo Passkey Smart Wallet is currently hosted at [sample-passkey-turnkey.vercel.app](https://sample-passkey-turnkey.vercel.app). See [legal disclaimer](#legal-disclaimer).

<img src="https://blog-cms.openfort.xyz/uploads/passkey_smart_wallet_1b79a44fdc.png?updated_at=2023-10-27T13:59:12.921Z" alt="homepage screenshot" width="800px">

## How it works

This application has two components:
* the frontend (in [`frontend`](./frontend/)) is a NextJS app running in browsers. Responsibilities are: serve the UI, make calls to the backend component, and execute passkey interactions (assertions or attestations). Passkey interactions are abstracted through [Turnkey JS SDK](https://github.com/tkhq/sdk). This is deployed through [Vercel](https://vercel.com/).
* the backend (main file: [`index.ts`](./backend/index.ts)) is a Express application handling requests made by the frontend. It uses the [Turnkey JS SDK](https://github.com/tkhq/sdk) to interact with the Turnkey API and [Openfort Node SDK](https://github.com/openfort-xyz/openfort-node) to interact with the smart wallet. For deployment we use [Railway](https://www.railway.app/).

Requests and responses use JSON-over-HTTP. Now let's talk about the different flows implemented, one-by-one.

### Registration

The frontend uses a `whoami` endpoint to know whether a user has a current valid session. If not, the user needs to authenticate with a passkey. Let's pretend our user has never registered before: no previous session, no registered passkey!

When authentication happens, the email address entered in the authentication form is used to lookup users on the backend. Because the user is not found, the frontend performs a Webauthn registration ceremony with [Turnkey SDK](https://github.com/tkhq/sdk)'s `getWebAuthnAttestation` method: 

<img src="https://blog-cms.openfort.xyz/uploads/registration_screenshot_f4613eb67f.png?updated_at=2023-10-27T14:00:39.390Z" alt="registration dialog" width="400px">

The collected credentials are used as parameters to the Turnkey API to create a new [Turnkey Sub-Organization](https://docs.turnkey.com/getting-started/sub-organizations). Each user registering their passkey has their own Turnkey Sub-Organization under the hood. The parent organization has **read-only access** to each sub-organization, but cannot modify their content or sign crypto transactions with any private keys held within Sub-Organizations.

### Signing In

Assuming a user is registered already, they will see a different prompt in their browser's native UI. Here's the authentication prompt in Chrome:

<img src="https://blog-cms.openfort.xyz/uploads/authentication_screenshot_75e120d6c8.png?updated_at=2023-10-27T14:00:40.001Z" alt="authentication dialog" width="400px">

Once again, the frontend doesn't have to know anything about webauthn: it uses the Turnkey SDK method `getWebAuthnAssertion` to collect a signature from the user for a Turnkey "whoami" request for their sub-organization.

The backend then forwards this signed request to Turnkey. If the request is successful, then it means the user is indeed the owner of this sub-organization, and the backend grants a session as a result. The user is logged in!

### Mint NFT

For a signed-in user, the dashboard shows functionality to mint an NFT.  The amount and destination parameters are POSTed to the backend, the backend requests Openfort to construct an unsigned sponsored payload using [policies](https://www.openfort.xyz/docs/guides/smart-accounts/policies), and the frontend uses this to construct a Turnkey Sign Transaction request. This request is signed via a webauthn assertion (remember, end-users are the only ones able to perform any action in their respective sub-organization!), and forwarded to backend. The backend then grabs the signature and forwards it back to Openfort who puts it on-chain.

<img src="https://blog-cms.openfort.xyz/uploads/turnkey_passkey_bc074f873e.svg?updated_at=2023-10-27T14:15:51.683Z" alt="authentication dialog" width="400px">


## Running locally

### Database

Install Postgres:
```
$ brew install postgresql@14
```

Start the DB:
```
# Customize the DB port and name with your own local DB name/port
$ pg_ctl -D /opt/homebrew/var/postgres -o "-p 5555" start

# You can check that the DB works by running:
$ psql -p 5555 -d turnkey-passkey
```

### Backend

This is an [ExpressJS](https://expressjs.com/) REST API that uses [Prisma](https://www.prisma.io/) to connect to a Postgres database and CRUD.

```sh
$ yarn

# Copy the template env file and populate values
$ cp .env.template .env

$ yarn migrate:dev

$ yarn dev

```

The backend should now be running on [localhost:12345](http://localhost:12345/).

### Frontend

```sh
$ cd frontend

# Create your own .env.local file
$ cp .env.example .env.local

$ npm run dev
```

The frontend should start on port 3456: visit http://localhost:3456

# Legal Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL TURNKEY BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

We are providing this demo passkey wallet as a convenience to demonstrate certain features and functionality (the "Demo Application"). By using this Demo Application, you acknowledge and agree that Demo Applications are provided for testing and demonstrative purposes only, have limited functionality, are likely to contain errors and/or defects and are not suitable for production use. This Demo Application is provided "AS IS" and "AS AVAILABLE." You should not rely on the performance or correct functioning of this Demo Application, nor should you rely on it for production or mainnet use. Under no circumstances may you send any funds or digital assets to any wallet address created by this Demo Application and any such funds or digital assets will be unrecoverable. You understand and agree that we may change, withdraw, terminate your access to, testing of and/or use of, or discontinue this Demo Application, or any respective portions thereof, at any time and in our sole discretion, with or without notice to you.