import * as React from "react";
import Openfort from "@openfort/openfort-js";
import {toast} from "react-toastify";
import RPC from "./evm.ethers";

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export function CollectButton({
    provider,
    uiConsole,
    logout,
    playerId,
}: {
    provider: any;
    uiConsole: any;
    logout: any;
    playerId: string;
}) {
    const [collectLoading, setCollectLoading] = React.useState(false);

    const handleCollectButtonClick = async () => {
        var openfortTransactionResponse;
        try {
            if (!provider) {
                uiConsole("provider not initialized yet");
                return;
            }
            const {idToken} = await provider.authenticateUser();

            const privKey: any = await provider.provider?.request({
                method: "eth_private_key",
            });

            const pubkey = "0x";
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
                if (!(await openfort.loadSessionKey())) {
                    const rpc = new RPC(provider.provider!);
                    const ownerSignedTransaction = await rpc.signMessage(
                        collectResponseJSON.data.nextAction.payload.userOpHash,
                    );

                    toast.dismiss(toastId);
                    toastId = toast.loading("Owner Key Waiting for Signature");
                    openfortTransactionResponse = await openfort.sendSignatureTransactionIntentRequest(
                        collectResponseJSON.data.id,
                        ownerSignedTransaction,
                    );
                    if (openfortTransactionResponse) {
                        toast.dismiss(toastId);
                        toast.success("Item Collected Successfully");
                    }
                } else {
                    const sessionSignedTransaction = openfort.signMessage(
                        collectResponseJSON.data.nextAction.payload.userOpHash,
                    );
                    toast.dismiss(toastId);
                    toastId = toast.loading("Session Key Waiting for Signature");
                    openfortTransactionResponse = await openfort.sendSignatureTransactionIntentRequest(
                        collectResponseJSON.data.id,
                        sessionSignedTransaction,
                    );
                    if (openfortTransactionResponse) {
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
