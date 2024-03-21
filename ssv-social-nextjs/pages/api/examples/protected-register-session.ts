// This is an example of to protect an API route
import {getServerSession} from "next-auth/next";
import {authOptions} from "../auth/[...nextauth]";

import type {NextApiRequest, NextApiResponse} from "next";
import Openfort, { CreateSessionRequest } from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (session) {
        // Get the address of the session key.
        const {address} = req.body;

        const createSessionRequest: CreateSessionRequest = {
            player: process.env.NEXTAUTH_OPENFORT_PLAYER!,
            address: address!.toString(),
            chainId: Number(process.env.NEXTAUTH_OPENFORT_CHAINID!),
            validUntil: 281474976710655,
            validAfter: 0,
            policy: process.env.NEXTAUTH_OPENFORT_POLICY!,
        };

        try {
            const playerSession = await openfort.sessions.create(createSessionRequest);

            return res.send({
                data: playerSession,
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
