// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import Openfort, {CreatePlayerSessionRequest} from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(
    req: {
        query: any;
        headers: {authorization: string; query: any};
        body: {user_uuid: any; sessionPubKey: any,player:string};
    },
    res: {
        status: (arg0: number) => {
            (): any;
            new (): any;
            json: {
                (arg0: {name?: string; data?: any; error?: any}): void;
                new (): any;
            };
        };
    },
) {
    try {
        const idToken = req.headers.authorization?.split(" ")[1] || "";
        const user_uuid = req.body.user_uuid;
        const playerId = req.body.player;
        const sessionKeyAddress = req.body.sessionPubKey;

        const response = await axios.post(
            "https://api.particle.network/server/rpc",
            {
              jsonrpc: "2.0",
              id: 0,
              method: "getUserInfo",
              params: [user_uuid, idToken],
            },
            {
              auth: {
                username: process.env.NEXT_PUBLIC_PROJECT_ID!,
                password: process.env.PARTICLE_SECRET_PROJECT_ID!,
              },
            }
          );

        const uuid = response.data.result.uuid;
        const wallets = response.data.result.wallets;
        const evm_wallet = wallets.find((wallet: any) => wallet.chain == "evm_chain");

        if (uuid == user_uuid) {
            const createSessionRequest: CreatePlayerSessionRequest = {
                playerId: playerId,
                address: sessionKeyAddress,
                chainId: Number(process.env.NEXTAUTH_OPENFORT_CHAINID!),
                validUntil: 281474976710655,
                validAfter: 0,
                policy: process.env.NEXTAUTH_OPENFORT_POLICY!,
                externalOwnerAddress: evm_wallet.publicAddress,
            };
            const playerSession = await openfort.players.createSession(createSessionRequest);

            if (playerSession) {
                console.log("Session created successfully. ", playerSession);
                res.status(200).json({
                    name: "Session creation success.",
                    data: playerSession,
                });
            } else {
                res.status(400).json({name: "Failed"});
            }
        } else {
            res.status(400).json({name: "Failed"});
        }
    } catch (error) {
        res.status(500).json({error: error});
    }
}
