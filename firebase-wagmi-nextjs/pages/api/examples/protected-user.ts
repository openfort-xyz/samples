// This is an example of to protect an API route

import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import Openfort from "@openfort/openfort-node";
import adminInit from "../../../lib/firebaseConfig/init-admin";
import nookies from "nookies";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { idToken } = nookies.get({ req });
    var fbInfo = await adminInit.auth().verifyIdToken(idToken);

    const userDocRef = adminInit
      .firestore()
      .collection("users")
      .doc(fbInfo.user_id);
    const userDoc = await userDocRef.get();
    if (fbInfo) {
      if (userDoc.exists) {
        // The user document exists already, so just return the nonce
        const existingNonce = userDoc.data()?.nonce;
        res.status(200).json({ nonce: existingNonce });
      } else {
        // The user document does not exist, create it first
        const generatedNonce = Math.floor(Math.random() * 1000000).toString();
        // Create an Auth user
        let playerOf = await openfort.players.create({
          name: fbInfo.email ?? "Anonymous",
        });
        let playerOfID = playerOf.id;

        // Associate the nonce with that user
        await adminInit
          .firestore()
          .collection("users")
          .doc(fbInfo.user_id)
          .set({
            nonce: generatedNonce,
            playerOf: playerOfID,
          });
        res.status(200).json({ nonce: generatedNonce });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error getting nonce" });
  }
};

export default handler;
