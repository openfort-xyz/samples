// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Openfort from "@openfort/openfort-node";
import axios from "axios";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(
    req: {headers: {authorization: string}; body: {user_uuid: string}},
    res: {
        status: (arg0: number) => {
            (): any;
            new (): any;
            json: {(arg0: {name?: string; error?: any, player?:string}): void; new (): any};
        };
    },
) {
    try {
        const idToken = req.headers.authorization?.split(" ")[1] || "";
        const user_uuid = req.body.user_uuid;

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
        const email = response.data.result.googleEmail;
        const wallets = response.data.result.wallets;

        const evm_wallet = wallets.find((wallet: any) => wallet.chain == "evm_chain");

        if (uuid == user_uuid) {
            const playerAccountAddress = await openfort.players.create({
                name: email,
                description: evm_wallet.publicAddress,
            });

            if (playerAccountAddress) {
                console.log("Player found. ", playerAccountAddress);
                res.status(200).json({name: "Validation Success. Player created.", player: playerAccountAddress.id});
            } else {
                console.log("Failed creating account.");
                res.status(400).json({name: "Failed creating account"});
            }
        } else {
            res.status(400).json({name: "Failed"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error});
    }
}
