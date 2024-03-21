//@ts-nocheck
import axios from "axios";
import Openfort, { CreateTransactionIntentRequest, Interaction } from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

async function fetchUserInfo(user_uuid: string, idToken: string) {
  const response = await axios.post(
    "https://api.particle.network/server/rpc",
    { jsonrpc: "2.0", id: 0, method: "getUserInfo", params: [user_uuid, idToken] },
    { auth: { username: process.env.NEXT_PUBLIC_PROJECT_ID!, password: process.env.PARTICLE_SECRET_PROJECT_ID! } }
  );
  return response.data.result;
}

export default async function handler(req, res) {
  try {
    const idToken = req.headers.authorization?.split(" ")[1] || "";
    const { user_uuid, player: playerId } = req.body;

    const { uuid, wallets } = await fetchUserInfo(user_uuid, idToken);
    const evm_wallet = wallets.find(wallet => wallet.chain === "evm_chain");

    if (uuid === user_uuid) {
      const interaction: Interaction = {
        contract: process.env.NEXTAUTH_OPENFORT_CONTRACT!,
        functionName: "mint",
        functionArgs: [playerId],
      };

      const createTransactionIntentRequest: CreateTransactionIntentRequest = {
        player: playerId,
        chainId: Number(process.env.NEXTAUTH_OPENFORT_CHAINID!),
        optimistic: false,
        interactions: [interaction],
        policy: process.env.NEXTAUTH_OPENFORT_POLICY!,
        externalOwnerAddress: evm_wallet.publicAddress,
      };

      const transactionIntent = await openfort.transactionIntents.create(createTransactionIntentRequest);
      if (transactionIntent) {  
        res.status(200).json({ name: "Item collection success.", data: transactionIntent });
      } else {
        res.status(400).json({ name: "Failed" });
      }
    } else {
      res.status(400).json({ name: "Failed" });
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error });
  }
}