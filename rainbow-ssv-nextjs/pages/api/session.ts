// This is an example of to protect an API route
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "./auth/[...nextauth]";

import type { NextApiRequest, NextApiResponse } from "next";
import Openfort from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, getAuthOptions(req));

  if (session) {
    // Get address from req.query

    const { address } = req.body;
    const policy_id = process.env.NEXTAUTH_OPENFORT_POLICY!;
    const player_id = process.env.NEXTAUTH_OPENFORT_PLAYER!;
    const valid_until = 281474976710655;
    const valid_after = 0;
    const chain_id = Number(process.env.NEXTAUTH_OPENFORT_CHAINID!);
    try {
      const session = await openfort.players.createPlayerSession(
        player_id,
        address!.toString(),
        chain_id,
        valid_until,
        valid_after,
        policy_id
      );
      return res.send({
        data: session,
      });
    } catch (e) {
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
