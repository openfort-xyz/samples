import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import adminInit from "../../lib/firebaseConfig/init-admin";
import Openfort from "@openfort/openfort-node";
import { isAddress } from "viem";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

const handler: NextApiHandler = async (
  request: NextApiRequest,
  response: NextApiResponse
) => {
  try {
    if (request.method !== "POST") {
      response.status(403).json({ error: "Endpoint only accepts POST method" });
    }
    if (!request.body.address) {
      response.status(400).json({ error: "Missing address" });
    }
    // Get the user document for that address
    const userDoc = await adminInit
      .firestore()
      .collection("users")
      .doc(request.body.address)
      .get();
    if (userDoc.exists) {
      // The user document exists already, so just return the nonce
      const existingNonce = userDoc.data()?.nonce;
      response.status(200).json({ nonce: existingNonce });
    } else {
      // The user document does not exist, create it first
      const generatedNonce = Math.floor(Math.random() * 1000000).toString();
      // Create an Auth user
      let playerOf = await openfort.players.create({
        name: request.body.address,
      });
      let playerOfID = playerOf.id;

      const createdUser = await adminInit.auth().createUser({
        uid: request.body.address,
      });

      if (isAddress(request.body.address)) {
        // Create an Openfort account with a external owner address
        await openfort.accounts.create({
          player: playerOfID,
          external_owner_address: request.body.address,
          chain_id: 80001,
        });
      }

      // Associate the nonce with that user
      await adminInit.firestore().collection("users").doc(createdUser.uid).set({
        nonce: generatedNonce,
        playerOf: playerOfID,
      });
      response.status(200).json({ nonce: generatedNonce });
    }
  } catch (err) {
    console.log(err);
    response.status(500).json({ error: "Error getting nonce" });
  }
};

export default handler;
