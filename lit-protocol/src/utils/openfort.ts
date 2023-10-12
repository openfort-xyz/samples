import { IRelayPKP as OriginalIRelayPKP } from "@lit-protocol/types";
export interface IRelayPKPExtended extends OriginalIRelayPKP {
    smartWalletAddress: string;
  }
/**
 * Create an Openfort smart account
 */
export async function  createOpenfortAccount(
    ethAddress : string
): Promise<string> {
    try {
        const createAccountRequest = await fetch("/api/create-smart-wallet", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ethAddress: ethAddress}),
        });
        if (createAccountRequest.status === 200) {
            const data = await createAccountRequest.json();
            return data.accountAddress
        } else {
            console.log('Verification failed.')
            return null
        }
    } catch (err) {
        console.log(err)
    }
}

/**
 * Get Openfort smart accounts from PKPs
 */
export async function getOpenfortAccounts( 
    RelayPKP:OriginalIRelayPKP[]
): Promise<IRelayPKPExtended[]> {

    // use promise to get all smart accounts
    let smartAccounts = await Promise.all(RelayPKP.map(async (pkp) => {
        const getAccountRequest = await fetch("/api/get-smart-wallet", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ethAddress: pkp.ethAddress}),
        });
        if (getAccountRequest.status === 200) {
            const data = await getAccountRequest.json();
            return { ...pkp, smartWalletAddress: data.accountAddress };
        } else {
            console.log('Verification failed.')
            return { ...pkp, smartWalletAddress: null };
        }
    }));


    smartAccounts = smartAccounts.filter((pkp) => pkp.smartWalletAddress !== null);
    return smartAccounts;
}