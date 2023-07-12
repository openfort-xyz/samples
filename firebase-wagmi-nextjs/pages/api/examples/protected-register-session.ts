import type { NextApiRequest, NextApiResponse } from "next";
import Openfort from "@openfort/openfort-node";
import adminInit from "../../../lib/firebaseConfig/init-admin";
import nookies from "nookies";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { idToken } = nookies.get({ req });
  var fbInfo = await adminInit.auth().verifyIdToken(idToken);

  if (!req.body.address) {
    res.status(400).json({ error: "Missing address" });
  }
  const address = req.body.address;
  const userDocRef = adminInit
    .firestore()
    .collection("users")
    .doc(fbInfo.user_id);
  const userDoc = await userDocRef.get();

  if (fbInfo && userDoc.exists) {
    // Get the address of the session key.
    const player_id = userDoc.data()?.playerOf;
    const policy_id = process.env.NEXTAUTH_OPENFORT_POLICY!;
    const chain_id = Number(process.env.NEXTAUTH_OPENFORT_CHAINID!);
    const valid_until = 281474976710655;
    const valid_after = 0;

    try {
      const playerSession = await openfort.sessions.create({
        player: player_id,
        chain_id,
        valid_after,
        valid_until,
        policy: policy_id,
        address: address!.toString(),
      });

      return res.send({
        data: playerSession,
      });
    } catch (e: any) {
      console.log(e);
      return res.send({
        data: null,
      });
    }
  }

  res.send({
    error: "You must be signed in to view the protected content on this page.",
  });
}
