// This is an example of to protect an API route
import {getServerSession} from "next-auth/next";
import {getAuthOptions} from "./auth/[...nextauth]";

import type {NextApiRequest, NextApiResponse} from "next";
import Openfort, {StartRecoveryRequest} from "@openfort/openfort-node";
import { getSession } from "next-auth/react";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!, "http://localhost:3000");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, getAuthOptions(req));

    const account = await openfort.players.listAccounts({id: process.env.NEXTAUTH_OPENFORT_PLAYER!});

    if (session) {
        const startRecoveryRequest: StartRecoveryRequest = {
            accountId: account.data[0].id,
            newOwnerAddress: process.env.NEW_OWNER!,
            policy: process.env.NEXTAUTH_OPENFORT_POLICY!
        };

        try {
            const startRecovery_response = await openfort.accounts.startRecovery(startRecoveryRequest);

            return res.send({
                data: startRecovery_response,
            });
        } catch (e: any) {
            console.log(e.body);
            return res.send({
                data: null,
            });
        }
    }

    res.send({
        error: "You must be signed in to view the protected content on this page.",
    });
}
