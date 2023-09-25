// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as jose from "jose";
import Openfort, {CreateTransactionIntentRequest, Interaction} from "@openfort/openfort-node";
import { arrayify } from "ethers/lib/utils";
import { ethers } from "ethers";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(
    req: {
        headers: {authorization: string};
        body: {appPubKey: any; player: any; item: any};
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
        const {appPubKey: app_pub_key, player:playerId} = req.body;

        const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
        const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
            algorithms: ["ES256"],
        });
        if ((jwtDecoded.payload as any).wallets[0].public_key == app_pub_key) {
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
                externalOwnerAddress: ethers.utils.computeAddress(arrayify("0x" + app_pub_key)),
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
