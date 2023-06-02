// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as jose from "jose";
import Openfort from "@openfort/openfort-node";
import { ethers } from "ethers";
import { arrayify } from "ethers/lib/utils";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(
  req: {
    query: any;
    headers: { authorization: string; query: any };
    body: { appPubKey: any; sessionPubKey: any };
  },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: {
        (arg0: { name?: string; data?: any; error?: any }): void;
        new (): any;
      };
    };
  }
) {
  try {
    const {
      query: { player },
    } = req;
    const idToken = req.headers.authorization?.split(" ")[1] || "";
    const app_pub_key = req.body.appPubKey;
    const sessionKeyAddress = req.body.sessionPubKey;

    const jwks = jose.createRemoteJWKSet(
      new URL("https://api.openlogin.com/jwks")
    );
    const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
      algorithms: ["ES256"],
    });
    if ((jwtDecoded.payload as any).wallets[0].public_key == app_pub_key) {
      const policy_id = process.env.NEXTAUTH_OPENFORT_POLICY!;
      const player_id = process.env.NEXTAUTH_OPENFORT_PLAYER!;
      const valid_until = 281474976710655;
      const valid_after = 0;
      const chain_id = Number(process.env.NEXTAUTH_OPENFORT_CHAINID!);
      const external_owner_address = ethers.utils.computeAddress(
        arrayify("0x" + app_pub_key)
      );

      const playerSession = await openfort.players.createPlayerSession(
        player_id,
        sessionKeyAddress,
        chain_id,
        valid_until,
        valid_after,
        policy_id,
        external_owner_address
      );

      if (playerSession?.body) {
        console.log("Session created successfully. ", playerSession?.body);
        res.status(200).json({
          name: "Session creation success.",
          data: playerSession?.body,
        });
      } else {
        res.status(400).json({ name: "Failed" });
      }
    } else {
      res.status(400).json({ name: "Failed" });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
}
