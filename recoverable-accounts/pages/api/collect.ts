// This is an example of to protect an API route
import {getServerSession} from "next-auth/next";
import {getAuthOptions} from "./auth/[...nextauth]";

import type {NextApiRequest, NextApiResponse} from "next";
import Openfort, {Interaction, CreateTransactionIntentRequest} from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, getAuthOptions(req));

    if (session) {
        // Could use the address to find the player in the game server and the Openfort playerId associated to it.

        const interaction: Interaction = {
            contract: process.env.NEXTAUTH_OPENFORT_CONTRACT!,
            functionName: "mint",
            functionArgs: [process.env.NEW_OWNER!],
        };
        const transactionIntentRequest: CreateTransactionIntentRequest = {
            player: process.env.NEXTAUTH_OPENFORT_PLAYER!,
            chainId: Number(process.env.NEXTAUTH_OPENFORT_CHAINID!),
            optimistic: true,
            interactions: [interaction],
            policy: process.env.NEXTAUTH_OPENFORT_POLICY!
        };
        try {
            const transactionIntent = await openfort.transactionIntents.create(transactionIntentRequest);

            return res.send({
                data: transactionIntent,
            });
        } catch (e: any) {
            console.log(e);
            return res.send({
                data: null,
            });
        }
    }

    res.send({
        error: "You must be signed in to view the protected content on this page.",
    });
}
