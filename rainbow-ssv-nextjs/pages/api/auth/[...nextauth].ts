// Code in this file is based on https://docs.login.xyz/integrations/nextauth.js
// with added process.env.VERCEL_URL detection to support preview deployments
// and with auth option logic extracted into a 'getAuthOptions' function so it
// can be used to get the session server-side with 'getServerSession'
import {IncomingMessage} from "http";
import {NextApiRequest, NextApiResponse} from "next";
import NextAuth, {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {getCsrfToken} from "next-auth/react";
import {SiweMessage} from "siwe";
import Openfort from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export function getAuthOptions(req: IncomingMessage): NextAuthOptions {
    const providers = [
        CredentialsProvider({
            async authorize(credentials) {
                try {
                    const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"));

                    const nextAuthUrl =
                        process.env.NEXTAUTH_URL ||
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
                    if (!nextAuthUrl) {
                        return null;
                    }

                    const nextAuthHost = new URL(nextAuthUrl).host;
                    if (siwe.domain !== nextAuthHost) {
                        return null;
                    }

                    if (siwe.nonce !== (await getCsrfToken({req}))) {
                        return null;
                    }

                    await siwe.verify({signature: credentials?.signature || ""});

                    let player, account;
                    try {
                        // Store the player that is logging in in the database.

                        player = await openfort.players.create({name: siwe.address});
                        // create an account for the new player and specify the external owner address
                        account = await openfort.accounts.create({
                            player: player.id,
                            chainId: 80001,
                            externalOwnerAddress: siwe.address,
                        });
                    } catch (e: any) {
                        console.log(e);
                        throw e;
                    }

                    return {
                        id: siwe.address,
                        name: player.id,
                        email: account.address,
                    };
                } catch (e) {
                    console.log(e);
                    return null;
                }
            },
            credentials: {
                message: {
                    label: "Message",
                    placeholder: "0x0",
                    type: "text",
                },
                signature: {
                    label: "Signature",
                    placeholder: "0x0",
                    type: "text",
                },
            },
            name: "Ethereum",
        }),
    ];

    return {
        callbacks: {
            async session({session, token}) {
                session.address = token.sub;
                session.playerId = session?.user?.name ?? "";
                session.OF_address = session?.user?.email ?? "";
                session.user = {
                    name: token.sub,
                };
                return session;
            },
        },
        // https://next-auth.js.org/configuration/providers/oauth
        providers,
        secret: process.env.NEXTAUTH_SECRET,
        session: {
            strategy: "jwt",
        },
    };
}

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
    const authOptions = getAuthOptions(req);

    // console.log("req.query.nextauth: ", req.query.nextauth);
    if (!Array.isArray(req.query.nextauth)) {
        res.status(400).send("Bad request");
        return;
    }

    const isDefaultSigninPage = req.method === "GET" && req.query.nextauth.find((value) => value === "signin");

    // Hide Sign-In with Ethereum from default sign page
    if (isDefaultSigninPage) {
        authOptions.providers.pop();
    }

    return await NextAuth(req, res, authOptions);
}
