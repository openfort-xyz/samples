import * as React from "react";
import Openfort from "@openfort/openfort-js";
import {ethers} from "ethers";
import {arrayify} from "@ethersproject/bytes";
import {useWalletClient} from "wagmi";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!, "http://localhost:3000");

export function CompleteRecoveryButton() {
    const [completeRecoveryLoading, setCompleteRecoveryLoading] = React.useState(false);
    const {data: walletClient} = useWalletClient();

    const handleCompleteRecoveryButtonClick = async () => {
        try {
            setCompleteRecoveryLoading(true);
            // openfort.startRecoveryProcess(); //
            await openfort.saveSessionKey();
            const address = openfort.sessionKey.address;
            const completeResponse = await fetch(`/api/complete-recovery`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({address}),
            });

            const completeResponseJSON = await completeResponse.json();

            if (completeResponseJSON.data?.nextAction) {
                const provider = new ethers.providers.Web3Provider(walletClient as any);
                const signer = provider.getSigner();
                let signedTransaction = await signer.signMessage(
                    arrayify(completeResponseJSON.data.nextAction.payload.userOpHash),
                );
                const optimistic = false;
                const openfortTransactionResponse = await openfort.sendSignatureSessionRequest(
                    completeResponseJSON.data.id,
                    signedTransaction,
                    optimistic,
                );
                if (openfortTransactionResponse) {
                    console.log("success:", openfortTransactionResponse);
                    alert("Recovery completed successfully");
                }
            } else {
                console.log("success:", completeResponseJSON.data);
                alert("Recovery completed successfully");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setCompleteRecoveryLoading(false);
        }
    };

    return (
        <div>
            <button type="button" disabled={completeRecoveryLoading} onClick={handleCompleteRecoveryButtonClick}>
                {completeRecoveryLoading ? "Completing a recovery process..." : "Complete recovery"}
            </button>
        </div>
    );
}
