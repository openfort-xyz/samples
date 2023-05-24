// This is an example of to protect an API route
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "./auth/[...nextauth]";

import type { NextApiRequest, NextApiResponse } from "next";
import Openfort from "@openfort/openfort-node";
import { CreateSessionPlayerRequest } from "@openfort/openfort-node/dist/model/createSessionPlayerRequest";

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

    const { address } = req.body;

    const player_id = "pla_96a0b33d-1399-438b-840d-4be1ed7cc622";
    const params: CreateSessionPlayerRequest = {
      address: address!.toString(),
      validUntil: 281474976710655,
      validAfter: 0,
      policy: "pol_dd95acbb-cae9-453f-8db5-e3df7c88f078",
      chainId: 80001,
    };

    try {
      const session = await openfort.players.createPlayerSession(
        player_id,
        params
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
