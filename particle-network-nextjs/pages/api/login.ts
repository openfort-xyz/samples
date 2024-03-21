import { NextApiRequest, NextApiResponse } from "next";
import Openfort from "@openfort/openfort-node";
import axios, { AxiosResponse } from "axios";

// Assuming the environment variables are correctly set in your .env file
const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

interface UserInfoResponse {
  uuid: string;
  googleEmail: string;
  wallets: Wallet[];
}

interface Wallet {
  chain: string;
  publicAddress: string;
}

async function fetchUserInfo(user_uuid: string, idToken: string): Promise<UserInfoResponse> {
  const response: AxiosResponse<{ result: UserInfoResponse }> = await axios.post(
    "https://api.particle.network/server/rpc",
    { jsonrpc: "2.0", id: 0, method: "getUserInfo", params: [user_uuid, idToken] },
    { auth: { username: process.env.NEXT_PUBLIC_PROJECT_ID!, password: process.env.PARTICLE_SECRET_PROJECT_ID! } }
  );
  return response.data.result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const idToken: string = req.headers.authorization?.split(" ")[1] || "";
    const { user_uuid } = req.body;

    if (typeof user_uuid !== 'string') {
      res.status(400).json({ error: 'user_uuid must be a string' });
      return;
    }

    const userInfo: UserInfoResponse = await fetchUserInfo(user_uuid, idToken);
    const evm_wallet: Wallet | undefined = userInfo.wallets.find(wallet => wallet.chain === "evm_chain");

    if (userInfo.uuid === user_uuid) {
      const player = await openfort.players.create({
        name: userInfo.googleEmail,
        description: evm_wallet ? evm_wallet.publicAddress : '',
      });

      if (player) {
        console.log("Player created.", player);
        res.status(200).json({ name: "Validation Success. Player created.", player: player });
      } else {
        res.status(400).json({ name: "Failed creating account" });
      }
    } else {
      res.status(400).json({ name: "Failed" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: (error as unknown as Error).message });
  }
}
