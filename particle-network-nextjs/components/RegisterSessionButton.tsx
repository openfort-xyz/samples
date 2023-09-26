import * as React from "react";
import Openfort from "@openfort/openfort-js";
import {toast} from "react-toastify";
import RPC from "./evm.ethers";

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export function RegisterButton({
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
    const [registerLoading, setRegisterLoading] = React.useState(false);

    const handleRegisterButtonClick = async () => {
        var openfortSessionResponse;
        try {
            if (!provider) {
                uiConsole("provider not initialized yet");
                return;
            }

            openfort.createSessionKey();
            await openfort.saveSessionKey();
            const address = openfort.sessionKey.address;
            const {idToken} = await provider.authenticateUser();
            const privKey: any = await provider.provider?.request({
                method: "eth_private_key",
            });
            const pubkey = "0x";
            let toastId = toast.loading("Registering session...");

            const sessionResponse = await fetch("/api/register-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({appPubKey: pubkey, sessionPubKey: address, player: playerId}),
            });
            const sessionResponseJSON = await sessionResponse.json();
            if (sessionResponseJSON.data?.nextAction) {
                toast.dismiss(toastId);
                toastId = toast.loading("Session Key Waiting for Signature");

                const rpc = new RPC(provider.provider!);
                const ownerSignedSession = await rpc.signMessage(
                    sessionResponseJSON.data.nextAction.payload.userOpHash,
                );

                openfortSessionResponse = await openfort.sendSignatureSessionRequest(
                    sessionResponseJSON.data.id,
                    ownerSignedSession,
                );

                if (openfortSessionResponse) {
                    toast.dismiss(toastId);
                    console.log("success:", openfortSessionResponse);
                    toast.success("Session Key Registered Successfully");
                }
            } else {
                toast.dismiss(toastId);
                toast.error("Session Key Registration Failed");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            uiConsole(openfortSessionResponse);
            setRegisterLoading(false);
        }
    };

    return (
        <div>
            <button className="card" type="button" disabled={registerLoading} onClick={handleRegisterButtonClick}>
                {registerLoading ? "Registering..." : "Register session"}
            </button>
        </div>
    );
}
