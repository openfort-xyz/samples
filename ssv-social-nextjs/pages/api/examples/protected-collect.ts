// This is an example of to protect an API route
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

import type { NextApiRequest, NextApiResponse } from "next";
import Openfort from "@openfort/openfort-node";
import { Interaction } from "@openfort/openfort-node/model/interaction";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    // Get address from req.query

    const player_id = process.env.NEXTAUTH_OPENFORT_PLAYER!;
    const policy_id = process.env.NEXTAUTH_OPENFORT_POLICY!;
    const contract_id = process.env.NEXTAUTH_OPENFORT_CONTRACT!;
    const chain_id = Number(process.env.NEXTAUTH_OPENFORT_CHAINID!);
    const optimistic = true;

    const interaction_mint: Interaction = {
      contract: contract_id,
      functionName: "mint",
      functionArgs: ['0x68Eae76287B996fBD2D2950CECe8eBAF7764e99C'],
    };
    try {
      const transactionIntent =
        await openfort.transactions.createTransactionIntent(
          player_id,
          chain_id,
          optimistic,
          [interaction_mint],
          policy_id
        );

      return res.send({
        data: transactionIntent.body,
      });
    } catch (e: any) {
      console.log(e.body);
      return res.send({
        data: null,
      });
    }
  }

  res.send({
    error: "You must be signed in to view the protected content on this page.",
  });
}
