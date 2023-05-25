// This is an example of to protect an API route
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "./auth/[...nextauth]";

import type { NextApiRequest, NextApiResponse } from "next";
import Openfort from "@openfort/openfort-node";
import { Interaction } from "@openfort/openfort-node/model/interaction";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, getAuthOptions(req));

  if (session) {
    // Get address from req.query

    const { address } = req.query;
    // can use address to find the player in the game server and the Openfort player_id associated to it.

    const player_id = process.env.NEXTAUTH_OPENFORT_PLAYER!;
    const policy_id = process.env.NEXTAUTH_OPENFORT_POLICY!;
    const contract_id = process.env.NEXTAUTH_OPENFORT_CONTRACT!;
    const chain_id = Number(process.env.NEXTAUTH_OPENFORT_CHAINID!);
    const optimistic = true;

    const interaction: Interaction = {
      contract: contract_id,
      functionName: "mint",
      functionArgs: [player_id],
    };
    const transactionIntent =
      await openfort.transactions.createTransactionIntent(
        player_id,
        chain_id,
        optimistic,
        [interaction],
        policy_id
      );

    return res.send({
      data: transactionIntent,
    });
  }

  res.send({
    error: "You must be signed in to view the protected content on this page.",
  });
}
