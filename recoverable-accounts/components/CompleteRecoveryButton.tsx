import * as React from "react";
import {useWalletClient} from "wagmi";

export function CompleteRecoveryButton() {
    const [completeRecoveryLoading, setCompleteRecoveryLoading] = React.useState(false);

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
