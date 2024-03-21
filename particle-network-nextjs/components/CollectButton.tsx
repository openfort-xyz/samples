import * as React from "react";
import Openfort from "@openfort/openfort-js";
import {toast} from "react-toastify";
import RPC from "./evm.ethers";
import {ParticleProvider} from "@particle-network/provider";
import {ParticleNetwork} from "@particle-network/auth";

interface CollectButtonProps {
    provider: ParticleProvider;
    particle: ParticleNetwork;
    uiConsole: (message: any) => void;
    logout: () => void;
    playerId: string;
}

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export const CollectButton: React.FC<CollectButtonProps> = ({provider, particle, uiConsole, logout, playerId}) => {
    const [collectLoading, setCollectLoading] = React.useState<boolean>(false);

    const handleCollectButtonClick = async () => {
        let openfortTransactionResponse;
        try {
            if (!provider) {
                uiConsole("Provider not initialized yet");
                return;
            }

            const authInfo = particle.auth.getUserInfo();
            if (!authInfo) {
                uiConsole("Auth info not available");
                return;
            }

            let toastId = toast.loading("Collecting item...");

            const res = await fetch("/api/collect-asset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authInfo.token}`,
                },
                body: JSON.stringify({user_uuid: authInfo.uuid, player: playerId}),
            });

            const {data} = await res.json();
            toast.dismiss(toastId);

            if (!data?.nextAction) {
                toast.error("JWT Verification Failed");
                logout();
                return;
            }

            const payload = data.nextAction.payload.userOperationHash;
            const sessionKey = openfort.configureSessionKey();
            let signedTransaction;
            toastId = toast.loading(
                sessionKey.isRegistered ? "Session Key Waiting for Signature" : "Owner Key Waiting for Signature",
            );
            if (!sessionKey.isRegistered) {
                signedTransaction = await new RPC(provider).signMessage(payload);
                openfortTransactionResponse = await openfort.sendSignatureTransactionIntentRequest(
                    data.id,
                    signedTransaction,
                    signedTransaction,
                );
            } else {
                openfortTransactionResponse = await openfort.sendSignatureTransactionIntentRequest(
                    data.id,
                    signedTransaction,
                );
            }

            toast.dismiss(toastId);

            if (openfortTransactionResponse) {
                toast.success("Item Collected Successfully");
            }
        } catch (error) {
            console.error("Error:", error);
            if (error instanceof Error) uiConsole(error.message);
        } finally {
            uiConsole(openfortTransactionResponse);
            setCollectLoading(false);
        }
    };

    return (
        <div>
            <button className="card" type="button" disabled={collectLoading} onClick={handleCollectButtonClick}>
                {collectLoading ? "Minting..." : "Mint NFT"}
            </button>
        </div>
    );
};
