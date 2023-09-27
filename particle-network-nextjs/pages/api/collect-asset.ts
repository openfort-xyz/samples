// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import Openfort, {CreateTransactionIntentRequest, Interaction} from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(
    req: {
        headers: {authorization: string};
        body: {user_uuid: any; player: any; item: any};
    },
    res: {
        status: (arg0: number) => {
            (): any;
            new (): any;
            json: {
                (arg0: {name?: string; error?: any; data?: any}): void;
                new (): any;
            };
        };
    },
) {
    try {
        const idToken = req.headers.authorization?.split(" ")[1] || "";
        const {user_uuid, player:playerId} = req.body;

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
            const interaction: Interaction = {
                contract: process.env.NEXTAUTH_OPENFORT_CONTRACT!,
                functionName: "mint",
                functionArgs: [playerId],
            };
            const createTransactionIntentRequest: CreateTransactionIntentRequest = {
                player: playerId,
                chainId: Number(process.env.NEXTAUTH_OPENFORT_CHAINID!),
                optimistic: true,
                interactions: [interaction],
                policy: process.env.NEXTAUTH_OPENFORT_POLICY!,
                externalOwnerAddress: evm_wallet.publicAddress,
            };
            const transactionIntent = await openfort.transactionIntents.create(createTransactionIntentRequest);
            if (transactionIntent) {
                console.log("Item collected successfully. ", transactionIntent);
                res.status(200).json({
                    name: "Item collection success.",
                    data: transactionIntent,
                });
            } else {
                res.status(400).json({name: "Failed"});
            }
        } else {
            res.status(400).json({name: "Failed"});
        }
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({error: error});
    }
}
