// This is an example of to protect an API route
import {getServerSession} from "next-auth/next";
import {authOptions} from "../auth/[...nextauth]";

import type {NextApiRequest, NextApiResponse} from "next";
import Openfort from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (session) {
        // Get the address of the session key.
        const {address} = req.body;
        const acccountId = process.env.NEXTAUTH_OPENFORT_PLAYER!;

        try {
            const playerTransferOwnership = await openfort.accounts.requestTransferOwnership({
                id: acccountId,
                policy: process.env.NEXTAUTH_OPENFORT_POLICY!,
                newOwnerAddress: address!,
            });

            const playerAccountAddress = (await openfort.accounts.get({
                id: acccountId,
            })).address


            return res.send({
                data: {
                    tranferRequest: playerTransferOwnership,
                    playerAccountAddress,
                },
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
