// This is an example of to protect an API route
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "./auth/[...nextauth]";

import type { NextApiRequest, NextApiResponse } from "next";
import Openfort from "@openfort/openfort-node";
import { Interaction } from "@openfort/openfort-node/dist/model/interaction";

const openfort = new Openfort(
  process.env.NEXTAUTH_OPENFORT_SECRET_KEY!,
  "http://localhost:3000"
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, getAuthOptions(req));

  if (session) {
    // Get address from req.query

    const { address } = req.query;
    // can use address to find the player in the game server and the Openfort player_id associated to it.

    const player_id = "pla_96a0b33d-1399-438b-840d-4be1ed7cc622";
    const interaction: Interaction = {
      contract: "con_d2b78731-7563-44a4-8ebe-902ed3183ea2",
      functionName: "mint",
      functionArgs: [player_id],
    };
    const transactionIntent =
      await openfort.transactions.createTransactionIntent(
        player_id,
        80001,
        true,
        [interaction],
        "pol_dd95acbb-cae9-453f-8db5-e3df7c88f078"
      );

    return res.send({
      data: transactionIntent,
    });
  }

  res.send({
    error: "You must be signed in to view the protected content on this page.",
  });
}
