import * as React from "react";
import Openfort from "@openfort/openfort-js";
import {toast} from "react-toastify";
import RPC from "./evm.ethers";

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export function RegisterButton({
    provider,
    particle,
    uiConsole,
    logout,
    playerId,
}: {
    provider: any;
    particle: any;
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

            const authInfo = particle.auth.getUserInfo();

            openfort.createSessionKey();
            await openfort.saveSessionKey();
            const address = openfort.sessionKey.address;

            let toastId = toast.loading("Registering session...");

            const sessionResponse = await fetch("/api/register-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authInfo.token}`,
                },
                body: JSON.stringify({user_uuid: authInfo.uuid, sessionPubKey: address, player: playerId}),
            });
            const sessionResponseJSON = await sessionResponse.json();
            if (sessionResponseJSON.data?.nextAction) {
                toast.dismiss(toastId);
                toastId = toast.loading("Session Key Waiting for Signature");

                const rpc = new RPC(provider!);
                const ownerSignedSession = await rpc.signMessage(
                    sessionResponseJSON.data.nextAction.payload.userOpHash,
                );

                openfortSessionResponse = await openfort.sendSignatureSessionRequest(
                    sessionResponseJSON.data.id,
                    ownerSignedSession,
                );

                if (openfortSessionResponse) {
                    toast.dismiss(toastId);

                    toast.success("Session Key Registered Successfully");
                }
            } else {
                toast.dismiss(toastId);
                toast.error("Session Key Registration Failed");
                logout();
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
