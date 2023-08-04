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
        const playerId = process.env.NEXTAUTH_OPENFORT_PLAYER!;
        const chainId = Number(process.env.NEXTAUTH_OPENFORT_CHAINID!);

        try {
            const playerTransferOwnership = await openfort.players.requestTransferAccountOwnership({
                playerId: playerId,
                policy: process.env.NEXTAUTH_OPENFORT_POLICY!,
                chainId: chainId,
                newOwnerAddress: address!,
            });

            const playerAccountAddress = await openfort.players.listAccounts({
                id: playerId,
            });

            const accountAddress = playerAccountAddress.data.find((account) => account.chainId === chainId)?.address;

            return res.send({
                data: {
                    tranferRequest: playerTransferOwnership,
                    accountAddress,
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
