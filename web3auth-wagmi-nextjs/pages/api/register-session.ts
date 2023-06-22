// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as jose from "jose";
import Openfort, {CreatePlayerSessionRequest} from "@openfort/openfort-node";
import {ethers} from "ethers";
import {arrayify} from "ethers/lib/utils";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(
    req: {
        query: any;
        headers: {authorization: string; query: any};
        body: {appPubKey: any; sessionPubKey: any};
    },
    res: {
        status: (arg0: number) => {
            (): any;
            new (): any;
            json: {
                (arg0: {name?: string; data?: any; error?: any}): void;
                new (): any;
            };
        };
    },
) {
    try {
        const idToken = req.headers.authorization?.split(" ")[1] || "";
        const app_pub_key = req.body.appPubKey;
        const sessionKeyAddress = req.body.sessionPubKey;

        const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
        const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
            algorithms: ["ES256"],
        });
        if ((jwtDecoded.payload as any).wallets[0].public_key == app_pub_key) {
            const createSessionRequest: CreatePlayerSessionRequest = {
                id: process.env.NEXTAUTH_OPENFORT_PLAYER!,
                address: sessionKeyAddress,
                chain_id: Number(process.env.NEXTAUTH_OPENFORT_CHAINID!),
                valid_until: 281474976710655,
                valid_after: 0,
                policy: process.env.NEXTAUTH_OPENFORT_POLICY!,
                external_owner_address: ethers.utils.computeAddress(arrayify("0x" + app_pub_key)),
            };
            const playerSession = await openfort.players.createSession(createSessionRequest);

            if (playerSession) {
                console.log("Session created successfully. ", playerSession);
                res.status(200).json({
                    name: "Session creation success.",
                    data: playerSession,
                });
            } else {
                res.status(400).json({name: "Failed"});
            }
        } else {
            res.status(400).json({name: "Failed"});
        }
    } catch (error) {
        res.status(500).json({error: error});
    }
}
