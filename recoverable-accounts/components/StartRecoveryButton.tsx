import * as React from "react";
import Openfort from "@openfort/openfort-js";
import {ethers} from "ethers";
import {arrayify} from "@ethersproject/bytes";
import {useWalletClient} from "wagmi";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!, "http://localhost:3000");

export function StartRecoveryButton() {
    const [startRecoveryLoading, setStartRecoveryLoading] = React.useState(false);
    const {data: walletClient} = useWalletClient();

    const handleStartRecoveryButtonClick = async () => {
        try {
            setStartRecoveryLoading(true);
            const registerResponse = await fetch(`/api/start-recovery`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({address}),
            });

            const registerResponseJSON = await registerResponse.json();

            if (registerResponseJSON.data?.nextAction) {
                const provider = new ethers.providers.Web3Provider(walletClient as any);
                const signer = provider.getSigner();
                let signedTransaction = await signer.signMessage(
                    arrayify(registerResponseJSON.data.nextAction.payload.userOpHash),
                );
                const optimistic = false;
                const openfortTransactionResponse = await openfort.sendSignatureSessionRequest(
                    registerResponseJSON.data.id,
                    signedTransaction,
                    optimistic,
                );
                if (openfortTransactionResponse) {
                    console.log("success:", openfortTransactionResponse);
                    alert("Recovery started successfully");
                }
            } else {
                console.log("success:", registerResponseJSON.data);
                alert("Recovery started successfully");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setStartRecoveryLoading(false);
        }
    };

    return (
        <div>
            <button type="button" disabled={startRecoveryLoading} onClick={handleStartRecoveryButtonClick}>
                {startRecoveryLoading ? "Starting a recovery process..." : "Start recovery"}
            </button>
        </div>
    );
}
