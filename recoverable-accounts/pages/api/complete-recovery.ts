// This is an example of to protect an API route
import {getServerSession} from "next-auth/next";
import {getAuthOptions} from "./auth/[...nextauth]";

import type {NextApiRequest, NextApiResponse} from "next";
import Openfort, {CompleteRecoveryRequest} from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, getAuthOptions(req));

    const account = await openfort.accounts.get({id: process.env.NEXTAUTH_OPENFORT_PLAYER!});

    if (session) {
        const completeRecoveryRequest: CompleteRecoveryRequest = {
            accountId: account.id,
            newOwnerAddress: process.env.NEW_OWNER!,
            policy: process.env.NEXTAUTH_OPENFORT_POLICY!
        };

        try {
            const completeRecovery_response = await openfort.accounts.completeRecovery(completeRecoveryRequest);

            return res.send({
                data: completeRecovery_response,
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
