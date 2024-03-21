// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Openfort, {CreateTransactionIntentRequest, Interaction} from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);

export default async function handler(
    req: {headers: {authorization: string}; body: {ethAddress: string}},
    res: {
        status: (arg0: number) => {
            (): any;
            new (): any;
            json: {
                (arg0: {name?: string; error?: any; nextAction?: string,transactionIntentId?:string}): void;
                new (): any;
            };
        };
    },
) {
    try {
        // const idToken = req.headers.authorization?.split(" ")[1] || "";
        const ethAddress = req.body.ethAddress;
        const openfortPlayers = await openfort.players.list({name: ethAddress,expand: ["accounts"]});
        if(openfortPlayers.data.length > 0) {
            const interaction: Interaction = {
                contract: 'con_f127bfb8-ed5d-4ec1-b070-df562877cbe0',
                functionName: "mint",
                functionArgs: [openfortPlayers.data[0].id],
            };
            const createTransactionIntentRequest: CreateTransactionIntentRequest = {
                player: openfortPlayers.data[0].id,
                chainId: 80001,
                optimistic: true,
                interactions: [interaction],
                policy: 'pol_5b29d0d3-f6eb-4a46-9293-7e1ee1075f0c',
            };
            const transactionIntentResponse = await openfort.transactionIntents.create(createTransactionIntentRequest)
            if (transactionIntentResponse) {
                res.status(200).json({
                    name: "Item collection success.",
                    transactionIntentId:transactionIntentResponse.id,
                    nextAction: transactionIntentResponse.nextAction.payload.userOperationHash,
                });
            } else {
                res.status(400).json({error:"error"});
            }
        } else {
            res.status(400).json({error: "Failed, no smart account found with the provided address."});
        }
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({error: error});
    }
}
