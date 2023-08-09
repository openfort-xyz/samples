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
            const completeResponse = await fetch(`/api/complete-recovery`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: "",
            });

            const completeResponseJSON = await completeResponse.json();
            console.log("success:", completeResponseJSON.data);
            alert("Recovery completed successfully");
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
