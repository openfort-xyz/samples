// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Openfort from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(
    req: {headers: {authorization: string}; body: {ethAddress: string}},
    res: {
        status: (arg0: number) => {
            (): any;
            new (): any;
            json: {(arg0: {name?: string; error?: any; accountAddress?: string}): void; new (): any};
        };
    },
) {
    try {
        // const idToken = req.headers.authorization?.split(" ")[1] || "";
        const ethAddress = req.body.ethAddress;
        const openfortPlayers = await openfort.players.list({name: ethAddress,expand: ["accounts"]});
        if(openfortPlayers.data.length > 0) {
            res.status(200).json({name: "Validation Success. Player found.", accountAddress: openfortPlayers.data[0].accounts[0].address});
        } else{
            res.status(200).json({name: "Validation Success. Player not found.", accountAddress: null});
        }
    } catch (error) {
        res.status(500).json({error: error});
    }
}
