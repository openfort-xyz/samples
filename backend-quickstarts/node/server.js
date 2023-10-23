const express = require("express");
const path = require("path");
const { default: Openfort } = require("@openfort/openfort-node");
const dotenv = require("dotenv");

const CHAIN_ID = 80001;
const POLICY_ID = "pol_921245a6-9151-452a-aa72-2909d13ac404";
const PORT = process.env.PORT ?? 3000;

const app = express();

// Load environment variables
const envFilePath = path.resolve(__dirname, "./.env");
dotenv.config({ path: envFilePath });

if (!process.env.OPENFORT_SECRET_KEY) {
  throw new Error(
    `Unable to load the .env file. Please copy .env.example to ${envFilePath}`
  );
}

const openfort = new Openfort(process.env.OPENFORT_SECRET_KEY);

// Middleware to handle application/json with rawBody for webhooks
app.use(express.urlencoded({ extended: true }));
app.use(
  express.json({
    verify: (req, _, buf) => {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

// Middleware for consistent error/response handling
app.use((req, res, next) => {
  res.handleError = (error, statusCode = 400) => {
    res.status(statusCode).send({
      error: { message: error.message },
    });
  };

  res.handleSuccess = (data) => {
    res.send(data);
  };

  next();
});

app.post("/create-transaction", async (req, res) => {
  try {
    const player = await openfort.players.create({ name: "new player" });
    const interactions = [
      {
        contract: req.body.contractId,
        functionName: "mint",
        functionArgs: [player.id],
      },
    ];

    const transactionIntent = await openfort.transactionIntents.create({
      chainId: CHAIN_ID,
      optimistic: true,
      player: player.id,
      confirmationBlocks: 4,
      policy: POLICY_ID,
      interactions,
    });

    res.handleSuccess({
      transactionIntentId: transactionIntent.id,
      playerId: transactionIntent.player.id,
    });
  } catch (error) {
    res.handleError(error);
  }
});

app.post("/request-transfer-ownership", async (req, res) => {
  try {
    const transferRequest =
      await openfort.players.requestTransferAccountOwnership({
        chainId: CHAIN_ID,
        newOwnerAddress: req.body.newOwnerAddress,
        player: req.body.player,
        policy: POLICY_ID,
      });

    res.handleSuccess({ transferRequestId: transferRequest.id });
  } catch (error) {
    res.handleError(error);
  }
});

app.get("/", (req, res) => {
  res.send("Service is running");
});

app.get("/player-transactions", async (req, res) => {
  try {
    const player = await openfort.players.get({
      id: req.query.playerId,
      expand: ["transactionIntents"],
    });
    res.handleSuccess(player.transactionIntents);
  } catch (error) {
    res.handleError(error);
  }
});

app.post("/webhook", async (req, res) => {
  let event;
  try {
    console.log(`🔔  Webhook received!`);
    event = await openfort.constructWebhookEvent(
      req.rawBody,
      req.headers["openfort-signature"]
    );
  } catch (error) {
    console.error(`⚠️  Webhook signature verification failed.`);
    return res.handleError(error);
  }

  const transactionIntent = event.data;
  const response = transactionIntent.response;
  if (response && response.status === 1) {
    console.log(
      `✅  Transaction received!`,
      `https://mumbai.polygonscan.com/tx/${response.transactionHash}}`
    );
  } else if (response && response.status === 0) {
    console.log(`❌ Transaction reverted!`, response.error);
  }

  res.sendStatus(200);
});

app.listen(PORT, () =>
  console.log(`Node server listening at http://localhost:${PORT}/`)
);
