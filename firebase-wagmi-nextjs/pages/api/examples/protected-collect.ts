// This is an example of to protect an API route

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

  const userDocRef = adminInit
    .firestore()
    .collection("users")
    .doc(fbInfo.user_id);
  const userDoc = await userDocRef.get();
  if (fbInfo) {
    if (userDoc.exists) {
      const playerId = userDoc.data()?.playerOf;

      const policy_id = process.env.NEXTAUTH_OPENFORT_POLICY!;
      const contract_id = process.env.NEXTAUTH_OPENFORT_CONTRACT!;
      const chainId = Number(process.env.NEXTAUTH_OPENFORT_CHAINID!);
      const optimistic = true;

      const interaction_mint = {
        contract: contract_id,
        functionName: "mint",
        functionArgs: [playerId],
      };

      try {
        const transactionIntent = await openfort.transactionIntents.create({
          player: playerId,
          policy: policy_id,
          chainId,
          optimistic,
          interactions: [interaction_mint],
        });

        return res.send({
          data: transactionIntent,
        });
      } catch (e: any) {
        console.log(e);
        return res.send({
          data: null,
        });
      }
    }
  }

  res.send({
    error: "You must be signed in to view the protected content on this page.",
  });
}
