import * as React from "react";
import Openfort from "@openfort/openfort-js";
import {ethers} from "ethers";
import {arrayify} from "@ethersproject/bytes";
import {useWalletClient} from "wagmi";

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export function RevokeButton() {
    const [revokeLoading, setRevokeLoading] = React.useState(false);
    const {data: walletClient} = useWalletClient();

    const handleRevokeButtonClick = async () => {
        try {
            if (!(await openfort.loadSessionKey())) {
                alert("Session key not found. Please register session key first");
                return;
            }
            setRevokeLoading(true);
            const address = openfort.sessionKey.address;

            const revokeResponse = await fetch(`/api/revoke-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({address}),
            });
            const revokeResponseJSON = await revokeResponse.json();

            if (revokeResponseJSON.data?.nextAction) {
                const provider = new ethers.providers.Web3Provider(walletClient as any);
                const signer = provider.getSigner();
                let signedTransaction = await signer.signMessage(
                    arrayify(revokeResponseJSON.data.nextAction.payload.user_op_hash),
                );
                const optimistic = false;
                const openfortTransactionResponse = await openfort.sendSignatureSessionRequest(
                    revokeResponseJSON.data.id,
                    signedTransaction,
                    optimistic,
                );
                if (openfortTransactionResponse) {
                    openfort.removeSessionKey();
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
