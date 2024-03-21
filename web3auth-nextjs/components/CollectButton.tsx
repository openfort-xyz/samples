import * as React from "react";
import Openfort from "@openfort/openfort-js";
import {toast} from "react-toastify";
import RPC from "./evm.ethers";
import {getPublicCompressed} from "@toruslabs/eccrypto";

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export function CollectButton({
    web3auth,
    uiConsole,
    logout,
    playerId,
}: {
    web3auth: any;
    uiConsole: any;
    logout: any;
    playerId: string;
}) {
    const [collectLoading, setCollectLoading] = React.useState(false);

    const handleCollectButtonClick = async () => {
        var openfortTransactionResponse;
        try {
            if (!web3auth) {
                uiConsole("web3auth not initialized yet");
                return;
            }
            const {idToken} = await web3auth.authenticateUser();

            const privKey: any = await web3auth.provider?.request({
                method: "eth_private_key",
            });

            const pubkey = getPublicCompressed(Buffer.from(privKey, "hex")).toString("hex");
            let toastId = toast.loading("Collecting item...");
            // Validate idToken with server
            const collectResponse = await fetch("/api/collect-asset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({appPubKey: pubkey, item: 22, player: playerId}),
            });
            const collectResponseJSON = await collectResponse.json();

            if (collectResponseJSON.data?.nextAction) {
                const sessionKey = openfort.configureSessionKey();

                if (!sessionKey.isRegistered) {
                    const rpc = new RPC(web3auth.provider!);
                    const ownerSignedTransaction = await rpc.signMessage(
                        collectResponseJSON.data.nextAction.payload.userOperationHash,
                    );

                    toast.dismiss(toastId);
                    toastId = toast.loading("Owner Key Waiting for Signature");
                    openfortTransactionResponse = await openfort.sendSignatureTransactionIntentRequest(
                        collectResponseJSON.data.id,
                        collectResponseJSON.data.nextAction.payload.userOperationHash,
                        ownerSignedTransaction,
                    );
                    if (openfortTransactionResponse) {
                        toast.dismiss(toastId);
                        toast.success("Item Collected Successfully");
                    }
                } else {
                    const sessionSignedTransaction = await openfort.sendSignatureTransactionIntentRequest(
                        collectResponseJSON.data.id,
                        collectResponseJSON.data.nextAction.payload.userOperationHash,
                    );
                    toast.dismiss(toastId);
                    toastId = toast.loading("Session Key Waiting for Signature");

                    if (sessionSignedTransaction) {
                        toast.dismiss(toastId);
                        toast.success("Item Collected Successfully");
                    }
                }
            } else {
                toast.dismiss(toastId);
                toast.error("JWT Verification Failed");
                await logout();
            }
            return collectResponseJSON;
        } catch (error) {
            console.error("Error:", error);
        } finally {
            uiConsole(openfortTransactionResponse);
            setCollectLoading(false);
        }
    };

    return (
        <div>
            <button className="card" type="button" disabled={collectLoading} onClick={handleCollectButtonClick}>
                {collectLoading ? "Minting..." : "Mint NFT"}
            </button>
        </div>
    );
}
