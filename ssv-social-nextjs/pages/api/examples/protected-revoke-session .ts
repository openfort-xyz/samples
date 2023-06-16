// This is an example of to protect an API route
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

import type { NextApiRequest, NextApiResponse } from "next";
import Openfort from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    // Get the address of the session key.
    const { address } = req.body;

    const policy_id = process.env.NEXTAUTH_OPENFORT_POLICY!;
    const player_id = process.env.NEXTAUTH_OPENFORT_PLAYER!;
    const chain_id = Number(process.env.NEXTAUTH_OPENFORT_CHAINID!);

    try {
      const playerSession = await openfort.players.revokePlayerSession(
        player_id,
        address!.toString(),
        chain_id,
        policy_id
      );

      return res.send({
        data: playerSession.body,
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
