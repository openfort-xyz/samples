// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as jose from "jose";
import Openfort from "@openfort/openfort-node";
import { Interaction } from "@openfort/openfort-node/model/interaction";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(
  req: {
    headers: { authorization: string };
    body: { appPubKey: any; player: any; item: any };
  },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: {
        (arg0: { name?: string; error?: any; data?: any }): void;
        new (): any;
      };
    };
  }
) {
  try {
    const idToken = req.headers.authorization?.split(" ")[1] || "";
    const { appPubKey: app_pub_key, player, item } = req.body;

    const jwks = jose.createRemoteJWKSet(
      new URL("https://api.openlogin.com/jwks")
    );
    const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
      algorithms: ["ES256"],
    });
    if ((jwtDecoded.payload as any).wallets[0].public_key == app_pub_key) {
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
      if (transactionIntent?.body) {
        console.log("Item collected successfully. ", transactionIntent?.body);
        res.status(200).json({
          name: "Item collection success.",
          data: transactionIntent?.body,
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
