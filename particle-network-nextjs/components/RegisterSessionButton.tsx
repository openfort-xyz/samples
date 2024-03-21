import React, {useState} from "react";
import Openfort from "@openfort/openfort-js";
import {toast} from "react-toastify";
import RPC from "./evm.ethers";
import {ParticleProvider} from "@particle-network/provider";
import {ParticleNetwork} from "@particle-network/auth";

interface RegisterButtonProps {
    provider: ParticleProvider;
    particle: ParticleNetwork;
    uiConsole: (message: any) => void;
    logout: () => void;
    playerId: string;
}

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export const RegisterButton: React.FC<RegisterButtonProps> = ({provider, particle, uiConsole, logout, playerId}) => {
    const [loading, setLoading] = useState<boolean>(false);

    const handleReg = async () => {
        if (!provider || !particle.auth) return;
        const auth = particle.auth.getUserInfo();
        if (!auth) {
            toast.error("Authentication info not found");
            return;
        }

        setLoading(true);
        const sessionKey = openfort.configureSessionKey();

        const toastId = toast.loading("Registering...");
        if (!sessionKey.isRegistered) {
            const res = await fetch("/api/register-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({
                    user_uuid: auth.uuid,
                    sessionPubKey: sessionKey.address,
                    player: playerId,
                }),
            });
            const json = await res.json();
            if (json.data?.nextAction) {
                const rpc = new RPC(provider);
                const openfortResp = await openfort.sendRegisterSessionRequest(
                    json.data.id,
                    await rpc.signMessage(json.data.nextAction.payload.userOperationHash),
                );

                if (openfortResp) {
                    toast.success("Registered successfully");
                    uiConsole(openfortResp);
                } else {
                    toast.error("Registration failed");
                    logout();
                }
            } else {
                toast.error("Registration failed");
                logout();
            }
        }

        setLoading(false);
        toast.dismiss(toastId);
    };

    return (
        <button className="card" disabled={loading} onClick={handleReg}>
            {loading ? "Registering..." : "Register Session"}
        </button>
    );
};
