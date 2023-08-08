import * as React from "react";
import Openfort from "@openfort/openfort-js";
import {ethers} from "ethers";
import {arrayify} from "@ethersproject/bytes";
import {useWalletClient} from "wagmi";

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export function RegisterButton() {
    const [registerLoading, setRegisterLoading] = React.useState(false);
    const {data: walletClient} = useWalletClient();

    const handleRegisterButtonClick = async () => {
        try {
            setRegisterLoading(true);
            openfort.createSessionKey();
            await openfort.saveSessionKey();
            const address = openfort.sessionKey.address;
            const registerResponse = await fetch(`/api/register-session`, {
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
                    alert("Session registered successfully");
                }
            } else {
                console.log("success:", registerResponseJSON.data);
                alert("Session registered successfully");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setRegisterLoading(false);
        }
    };

    return (
        <div>
            <button type="button" disabled={registerLoading} onClick={handleRegisterButtonClick}>
                {registerLoading ? "Registering..." : "Register session"}
            </button>
        </div>
    );
}
