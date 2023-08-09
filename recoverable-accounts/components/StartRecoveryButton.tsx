import * as React from "react";
import {useWalletClient} from "wagmi";

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
                body: "",
            });

            const registerResponseJSON = await registerResponse.json();

            console.log("success:", registerResponseJSON.data);
            alert("Recovery started successfully");
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
