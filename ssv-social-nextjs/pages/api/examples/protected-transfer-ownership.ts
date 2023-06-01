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
    const new_owner_address = address;
    const chain_id = Number(process.env.NEXTAUTH_OPENFORT_CHAINID!);

    try {
      const playerTransferOwnership =
        await openfort.players.transferAccountOwnership(
          player_id,
          chain_id,
          new_owner_address,
          policy_id
        );

      const playerAccountAddress = await openfort.players.getPlayer(player_id);
      // Find the player's accounts, the one at the same chain_id

      const address = playerAccountAddress.body.accounts.find(
        (account) => account.chainId === chain_id
      )?.address;

      return res.send({
        data: {
          tranferRequest: playerTransferOwnership.body,
          accountAddress: address,
        },
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
