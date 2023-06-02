// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as jose from "jose";
import Openfort from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(
  req: { headers: { authorization: string }; body: { appPubKey: any } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { name?: string; error?: any }): void; new (): any };
    };
  }
) {
  try {
    const idToken = req.headers.authorization?.split(" ")[1] || "";
    const app_pub_key = req.body.appPubKey;

    // Get address from appPubKey

    const jwks = jose.createRemoteJWKSet(
      new URL("https://api.openlogin.com/jwks")
    );
    const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
      algorithms: ["ES256"],
    });

    const player_id = process.env.NEXTAUTH_OPENFORT_PLAYER!;

    if ((jwtDecoded.payload as any).wallets[0].public_key == app_pub_key) {
      const playerAccountAddress = await openfort.players.getPlayer(player_id);

      if (playerAccountAddress) {
        console.log("Player found. ", playerAccountAddress?.body);
        res.status(200).json({ name: "Validation Success. Player created." });
      } else {
        console.log("Failed creating account.");
        res.status(400).json({ name: "Failed creating account" });
      }
    } else {
      res.status(400).json({ name: "Failed" });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
}
