import axios from "axios";
import Openfort, { CreateSessionRequest } from "@openfort/openfort-node";
import { NextApiRequest, NextApiResponse } from "next";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

async function fetchUserInfo(user_uuid: string, idToken: string) {
  const response = await axios.post(
    "https://api.particle.network/server/rpc",
    { jsonrpc: "2.0", id: 0, method: "getUserInfo", params: [user_uuid, idToken] },
    { auth: { username: process.env.NEXT_PUBLIC_PROJECT_ID!, password: process.env.PARTICLE_SECRET_PROJECT_ID! } }
  );
  return response.data.result;
}

interface UserInfoResponse {
  uuid: string;
  googleEmail: string;
  wallets: Wallet[];
}

interface Wallet {
  chain: string;
  publicAddress: string;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { authorization } = req.headers;
    const { user_uuid, sessionPubKey, player: playerId } = req.body;

    const idToken = authorization?.split(" ")[1] || "";
    const userInfo: UserInfoResponse = await fetchUserInfo(user_uuid, idToken);
    const evm_wallet: Wallet | undefined = userInfo.wallets.find(wallet => wallet.chain === "evm_chain");

    if (userInfo.uuid === user_uuid) {
      const createSessionRequest: CreateSessionRequest = {
        player: playerId,
        address: sessionPubKey,
        chainId: Number(process.env.NEXTAUTH_OPENFORT_CHAINID!),
        validUntil: 281474976710655,
        validAfter: 0,
        policy: process.env.NEXTAUTH_OPENFORT_POLICY!,
        externalOwnerAddress: evm_wallet ? evm_wallet.publicAddress : undefined,
      };

      const playerSession = await openfort.sessions.create(createSessionRequest);
      if (playerSession) {
        res.status(200).json({ name: "Session creation success.", data: playerSession });
      } else {
        res.status(400).json({ name: "Failed" });
      }
    } else {
      res.status(400).json({ name: "Failed" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
}