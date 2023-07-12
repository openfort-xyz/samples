// This is an example of to protect an API route
import {getServerSession} from "next-auth/next";
import {getAuthOptions} from "./auth/[...nextauth]";

import type {NextApiRequest, NextApiResponse} from "next";
import Openfort, {Interaction, TransactionIntentRequest} from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, getAuthOptions(req));

    if (session) {
        // Could use the address to find the player in the game server and the Openfort player_id associated to it.

        const interaction: Interaction = {
            contract: process.env.NEXTAUTH_OPENFORT_CONTRACT!,
            function_name: "mint",
            function_args: [session.player_id],
        };
        const transactionIntentRequest: TransactionIntentRequest = {
            player: session.player_id,
            chain_id: Number(process.env.NEXTAUTH_OPENFORT_CHAINID!),
            optimistic: true,
            interactions: [interaction],
            policy: process.env.NEXTAUTH_OPENFORT_POLICY!,
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
