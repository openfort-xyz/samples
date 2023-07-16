import * as React from "react";
import Openfort from "@openfort/openfort-js";
import {useWalletClient} from "wagmi";
import {ethers} from "ethers";
import {arrayify} from "@ethersproject/bytes";

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export function CollectButton({}) {
    const [collectLoading, setCollectLoading] = React.useState(false);
    const {data: walletClient} = useWalletClient();

    const handleCollectButtonClick = async () => {
        try {
            setCollectLoading(true);

            const collectResponse = await fetch(`/api/collect`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const collectResponseJSON = await collectResponse.json();

            if (collectResponseJSON.data?.nextAction) {
                let signedTransaction;
                if (await openfort.loadSessionKey()) {
                    // sign with the session key
                    signedTransaction = openfort.signMessage(collectResponseJSON.data.nextAction.payload.userOpHash);
                } else {
                    // sign with the owner signer
                    const provider = new ethers.providers.Web3Provider(walletClient as any);
                    const signer = provider.getSigner();
                    signedTransaction = await signer.signMessage(
                        arrayify(collectResponseJSON.data.nextAction.payload.userOpHash),
                    );
                }
                const optimistic = false;
                const openfortTransactionResponse = await openfort.sendSignatureTransactionIntentRequest(
                    collectResponseJSON.data.id,
                    signedTransaction,
                    optimistic,
                );
                if (openfortTransactionResponse.response?.status === 1) {
                    console.log("success:", openfortTransactionResponse);
                    alert("Mint performed successfully");
                }
            } else {
                console.log("success:", collectResponseJSON.data);
                alert("Mint performed successfully");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setCollectLoading(false);
        }
    };

    return (
        <div>
            <button type="button" disabled={collectLoading} onClick={handleCollectButtonClick}>
                {collectLoading ? "Minting..." : "Mint NFT"}
            </button>
        </div>
    );
}
