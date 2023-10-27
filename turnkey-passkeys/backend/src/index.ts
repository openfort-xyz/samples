import { PrismaClient } from "@prisma/client";
import express, { NextFunction } from "express";
import { SmartUser, UserTable } from "./data/userTable";
import session from "express-session";
import { TurnkeyClient, createActivityPoller } from "@turnkey/http";
import { ApiKeyStamper } from "@turnkey/api-key-stamper";
import { Request } from "express";
import { PrivateKeyTable } from "./data/privateKeyTable";
import {
  AuthenticationRequest,
  RegistrationRequest,
  SignedTurnkeyRequest,
} from "./types/requests";
import { refineNonNull } from "./utils/index";
import axios, { AxiosHeaders } from "axios";
import { PrismaSessionStore } from "./utils/prismaSessionStore";
import cors from "cors";
import Openfort, {
  CreateTransactionIntentRequest,
  Interaction,
} from "@openfort/openfort-node";
import { SmartAccountTable } from "./data/smartAccountTable";
import { ethers } from "ethers";

const prisma = new PrismaClient();
const SESSION_SALT = "your-session-salt";
export const SESSION_USER_ID_KEY = "user_id";

const app = express();
const port = process.env.PORT || 3000;
const prismaSessionStore = new PrismaSessionStore(prisma);
const corsOptions = {
  origin: ["http://localhost:3456", "https://sample-passkey-turnkey.vercel.app"],
  methods: ["GET", "POST"],
  allowedHeaders: ["content-type"],
  credentials: true,
  maxAge: 600,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));

// This stamper produces signatures using the API key pair passed in.
const stamper = new ApiKeyStamper({
  apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
  apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
});

// The Turnkey client uses the passed in stamper to produce signed requests
// and sends them to Turnkey
const turnkeyClient = new TurnkeyClient(
  {
    baseUrl: process.env.TURNKEY_API_HOST!,
  },
  stamper
);

const openfort = new Openfort(process.env.OPENFORT_API_KEY!);

app.use(
  session({
    secret: SESSION_SALT,
    resave: false,
    saveUninitialized: true,
    store: prismaSessionStore,
    cookie: { secure: false, maxAge: 60 * 60 * 24 * 1000 }, // 1 day
  })
);

turnkeyClient
  .getWhoami({ organizationId: process.env.TURNKEY_ORGANIZATION_ID! })
  .then((whoami: any) => {
    console.log("Turnkey AUTH", whoami);
  });

// /api/whoami
app.get("/api/whoami", async (req, res) => {
  const user = await getCurrentUser(req);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(204).send();
  }
});

app.get("/api/health", (req, res) => {
  res.status(200).send("OK");
});

// /api/registration/:email
app.get("/api/registration/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await UserTable.findUserByEmail(email);
    res.status(200).json({
      userId: user.id,
      subOrganizationId: user.subOrganizationId,
    });
  } catch {
    res.status(204).send();
  }
});

// /api/registration/:email
app.post("/api/register", async (req, res) => {
  try {
    const createSubOrgRequest: RegistrationRequest = req.body;

    const user = await UserTable.createUser(createSubOrgRequest.email); // Assume you've the createUser function defined or imported

    const activityPoller = createActivityPoller({
      client: turnkeyClient,
      requestFn: turnkeyClient.createSubOrganization,
    });

    const privateKeyName = `Default ETH Key`;

    const completedActivity = await activityPoller({
      type: "ACTIVITY_TYPE_CREATE_SUB_ORGANIZATION_V3",
      timestampMs: String(Date.now()),
      organizationId: process.env.TURNKEY_ORGANIZATION_ID!,
      parameters: {
        subOrganizationName: createSubOrgRequest.email,
        rootQuorumThreshold: 1,
        rootUsers: [
          {
            userName: "New user",
            apiKeys: [],
            authenticators: [
              {
                authenticatorName: "Passkey",
                challenge: createSubOrgRequest.challenge,
                attestation: createSubOrgRequest.attestation,
              },
            ],
          },
        ],
        privateKeys: [
          {
            privateKeyName: privateKeyName,
            curve: "CURVE_SECP256K1",
            addressFormats: ["ADDRESS_FORMAT_ETHEREUM"],
            privateKeyTags: [],
          },
        ],
      },
    });

    const subOrgId = refineNonNull(
      completedActivity.result.createSubOrganizationResultV3?.subOrganizationId
    );

    await UserTable.updateUserTurnkeySubOrganization(user.id, subOrgId);

    const privateKeys = refineNonNull(
      completedActivity.result.createSubOrganizationResultV3?.privateKeys
    );

    const privateKeyId = refineNonNull(privateKeys?.[0]?.privateKeyId);

    const privateKeyAddress = refineNonNull(
      privateKeys?.[0]?.addresses?.[0]?.address
    );

    const player = await openfort.players.create({
      name: createSubOrgRequest.email,
    });
    const account = await openfort.accounts.create({
      player: player.id,
      chainId: 80001,
      externalOwnerAddress: privateKeyAddress,
    });

    await SmartAccountTable.creatSmartAccount(
      user.id,
      player.id,
      account.address
    );
    await PrivateKeyTable.savePrivateKeyForUser(
      user,
      privateKeyId,
      privateKeyAddress
    );

    startUserLoginSession(req, user.id);

    res.status(200).send("Account successfully created");
  } catch (error: unknown) {
    console.log(error);
    res.status(500).send((error as any).message);
  }
});

// /api/authenticate
app.post("/api/authenticate", async (req, res) => {
  try {
    const signedRequest: AuthenticationRequest = req.body;

    let activityResponse;
    try {
      activityResponse = await axios.post(
        signedRequest.signedWhoamiRequest.url,
        JSON.parse(signedRequest.signedWhoamiRequest.body),
        {
          headers: {
            ["X-Stamp-Webauthn"]: signedRequest.signedWhoamiRequest
              .stamp as unknown as AxiosHeaders,
          },
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios error:",
          error.response?.data,
          error.response?.status,
          error.response?.headers
        );
      }
      throw error; // re-throw the error to be caught by the outer try-catch block
    }

    if (activityResponse.status !== 200) {
      res.status(500).json({
        message: `expected 200, got ${activityResponse.status}`,
      });
    }

    const subOrgId = refineNonNull(activityResponse.data.organizationId);
    const user = await UserTable.findUserBySubOrganizationId(subOrgId);

    startUserLoginSession(req, user.id);
    res.status(200).send("Successful login");
  } catch (error: unknown) {
    res.status(500).send((error as any).message);
  }
});

// /api/wallet/construct-tx
app.post("/api/wallet/construct-tx", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      res.status(403).send("no current user");
      return;
    }

    const privateKey = await getPrivateKeyForUser(user);
    if (!privateKey) {
      res.status(403).send("no current private key");
      return;
    }
    const interactionMint: Interaction = {
      contract: "con_c00e3daa-14ec-4c9c-8184-f66818fadc78",
      functionName: "mint",
      functionArgs: [user?.SmartAccount[0].openfortPlayer],
    };
    const createTransactionIntentRequest: CreateTransactionIntentRequest = {
      player: user?.SmartAccount[0].openfortPlayer!,
      chainId: 80001,
      optimistic: true,
      interactions: [interactionMint],
      policy: "pol_921245a6-9151-452a-aa72-2909d13ac404",
    };
    const transactionIntent = await openfort.transactionIntents.create(
      createTransactionIntentRequest
    );
    const aBytes = ethers.utils.arrayify(transactionIntent.nextAction?.payload.userOpHash!)
    const msg = ethers.utils.hashMessage(aBytes)
    res.status(200).json({
      unsignedTransaction: msg,
      transactionIntentId: transactionIntent.id,
      organizationId: user.subOrganizationId,
      privateKeyId: privateKey.turnkeyUUID,
    });
  } catch (error: unknown) {
    res.status(500).send((error as any).message);
  }
});

// /api/wallet/send-tx
app.post("/api/wallet/send-tx", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      res.status(403).send("no current user");
      return;
    }
    const signedRequest: SignedTurnkeyRequest = req.body;

    if (!signedRequest.signedTxnRequest.stamp) {
      res.status(422).send("Missing stamps");
      return;
    }
    let response;
    try {
      response = await axios.post(
        signedRequest.signedTxnRequest.url,
        JSON.parse(signedRequest.signedTxnRequest.body),
        {
          headers: {
            ["X-Stamp-WebAuthn"]: signedRequest.signedTxnRequest
              .stamp as unknown as AxiosHeaders,
          },
        }
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios error:",
          error.response?.data,
          error.response?.status,
          error.response?.headers
        );
      }
      throw error; // re-throw the error to be caught by the outer try-catch block
    }

    if (response.status !== 200) {
      res.status(500).json({
        message: `expected 200, got ${response.status}`,
      });
    }

    const result = response?.data?.activity?.result?.signRawPayloadResult;

    const signature = ethers.utils.joinSignature({
      r: `0x${result.r}`,
      s: `0x${result.s}`,
      v: parseInt(result.v) + 27,
    })

    const openfortTxn = await openfort.transactionIntents.signature({
      id: signedRequest.transactionIntentId,
      signature:signature,
    });

    res.status(200).json({ hash: openfortTxn.response?.transactionHash });
  } catch (error: unknown) {
    res.status(500).send((error as any).message);
  }
});

// /api/wallet/history
app.get("/api/wallet/history", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      res.status(403).send("no current user");
      return;
    }
    const transactions = await openfort.players.get({
      id: user.SmartAccount[0].openfortPlayer,
      expand: ["transactionIntents"],
    });

    res.status(200).json({ history: transactions.transactionIntents });
  } catch (error: unknown) {
    res.status(500).send((error as any).message);
  }
});

// /api/logout
app.post("/api/logout", (req, res, next) => {
  endUserSession(req, next);
  res.status(204).send("");
});

// /api/wallet
app.get("/api/wallet", async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) {
    res.status(403).send("no current user");
    return;
  }
  const balance = await openfort.inventories.getPlayerNativeInventory({
    playerId: user.SmartAccount[0].openfortPlayer,
    chainId: 80001,
  });

  try {
    const privateKey = await PrivateKeyTable.getPrivateKeyForUser(user);
    res.status(200).json({
      address: user.SmartAccount[0].ethereumAddress,
      turnkeyUuid: privateKey.turnkeyUUID,
      balance: balance.data.amount,
    });
  } catch (err) {
    res.status(500).send("unable to retrieve key for current user");
  }
});

app.listen(Number(port), "0.0.0.0", () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

export function getCurrentUser(req: Request): Promise<SmartUser | null> {
  const userIdOrNil = (req.session as any)[SESSION_USER_ID_KEY];

  if (userIdOrNil === undefined) {
    console.log("Get session returned undefined; no session provided?");
    return Promise.resolve(null);
  }

  const userId: number = userIdOrNil; // Assuming userId is stored as number in session
  return prisma.user
    .findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        email: true,
        id: true,
        SmartAccount: true,
        subOrganizationId: true,
        updatedAt: true,
      },
    })
    .catch((err) => {
      console.error(`Error while getting current user "${userId}": ${err}`);
      return null;
    });
}

export function getPrivateKeyForUser(user: SmartUser) {
  return PrivateKeyTable.getPrivateKeyForUser(user);
}

export function startUserLoginSession(req: Request, userId: number) {
  if (!req.session) return;

  (req.session as any)[SESSION_USER_ID_KEY] = userId;
  req.session.save((err) => {
    if (err) {
      console.error(`Error while saving session for user ${userId}: ${err}`);
    }
  });
}

export function endUserSession(req: Request, next: NextFunction) {
  const userIdOrNil = (req.session as any)[SESSION_USER_ID_KEY];

  if (userIdOrNil === undefined) {
    console.error("Error: trying to end session but no user ID data");
    return;
  }

  req.session?.destroy((err) => {
    if (err) {
      console.error(`Error while deleting current session: ${err}`);
    } else {
      console.log(`Success: user ${userIdOrNil} was logged out`);
      next();
    }
  });
}
