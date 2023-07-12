// This is an example of to protect an API route
import {getServerSession} from "next-auth/next";
import {authOptions} from "../auth/[...nextauth]";

import type {NextApiRequest, NextApiResponse} from "next";
import Openfort, {Interaction, TransactionIntentRequest} from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (session) {
        const interactionMint: Interaction = {
            contract: process.env.NEXTAUTH_OPENFORT_CONTRACT!,
            function_name: "mint",
            function_args: [process.env.NEXTAUTH_OPENFORT_PLAYER!],
        };
        const createTransactionIntentRequest: TransactionIntentRequest = {
            player: process.env.NEXTAUTH_OPENFORT_PLAYER!,
            chain_id: Number(process.env.NEXTAUTH_OPENFORT_CHAINID!),
            optimistic: true,
            interactions: [interactionMint],
            policy: process.env.NEXTAUTH_OPENFORT_POLICY!,
        };
        try {
            const transactionIntent = await openfort.transactionIntents.create(createTransactionIntentRequest);

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
