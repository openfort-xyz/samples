import * as React from "react";
import Openfort from "@openfort/openfort-js";
import {useWalletClient} from "wagmi";

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export function RevokeButton() {
    const [revokeLoading, setRevokeLoading] = React.useState(false);
    const {data: walletClient} = useWalletClient();

    const handleRevokeButtonClick = async () => {
        try {
            const sessionKey = openfort.configureSessionKey();
            if (!sessionKey.isRegistered) {
                alert("Session key not found. Please register session key first");
                return;
            }
            setRevokeLoading(true);
            const address = sessionKey.address;

            const revokeResponse = await fetch(`/api/revoke-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({address}),
            });
            const revokeResponseJSON = await revokeResponse.json();

            if (revokeResponseJSON.data?.nextAction) {
                let signedTransaction = await walletClient!.signMessage({
                    message: {raw: revokeResponseJSON.data.nextAction.payload.userOperationHash},
                });
                const optimistic = false;
                const openfortTransactionResponse = await openfort.sendSignatureSessionRequest(
                    revokeResponseJSON.data.id,
                    signedTransaction,
                    optimistic,
                );
                if (openfortTransactionResponse) {
                    openfort.logout();
                    console.log("success:", openfortTransactionResponse);
                    alert("Session revoked successfully");
                }
            } else {
                console.log("success:", revokeResponseJSON.data);
                alert("Session revoked successfully");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setRevokeLoading(false);
        }
    };

    return (
        <div>
            <button type="button" disabled={revokeLoading} onClick={handleRevokeButtonClick}>
                {revokeLoading ? "Revoke..." : "Revoke session"}
            </button>
        </div>
    );
}
