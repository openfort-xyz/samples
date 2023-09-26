import "react-toastify/dist/ReactToastify.css";

import {useEffect, useState} from "react";
import {toast} from "react-toastify";
import RPC from "../components/evm.ethers";

import Notice from "../components/Notice";
import {CollectButton} from "../components/CollectButton";
import {RegisterButton} from "../components/RegisterSessionButton";
import {useParticleProvider} from "@particle-network/connect-react-ui";
import {ParticleConnect, evmWallets} from "@particle-network/connect";
import {PolygonMumbai} from "@particle-network/chains";

function App() {
    const [connectKit, setConnectKit] = useState<ParticleConnect | null>(null);
    useEffect(() => {
        const init = async () => {
            try {
                const connectKitTemp = new ParticleConnect({
                    projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
                    clientKey: process.env.NEXT_PUBLIC_CLIENT_KEY as string,
                    appId: process.env.NEXT_PUBLIC_APP_ID as string,
                    chains: [PolygonMumbai],
                    wallets: [
                        ...evmWallets({
                            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
                            showQrModal: false,
                        }),
                    ],
                });
                setConnectKit(connectKitTemp);
            } catch (error) {
                console.error(error);
            }
        };

        init();
    }, []);

    const provider = useParticleProvider();

    const [playerId, setPlayerId] = useState<string | null>(null);

    const personalSign = async () => {
        const rpc = new RPC(provider!);

        const accounts = await rpc.getAccounts();
        const result = await rpc.signMessage("Hello Particle!");
        toast.success("Personal Sign Successful");
    };

    const login = async () => {
        if (!connectKit) {
            uiConsole("connectKit not initialized yet");
            return;
        }
        const particleProvider = await connectKit.connect("particle", {preferredAuthType: "google"});
        console.log(particleProvider);
        await validateIdToken();
    };

    const validateIdToken = async () => {
        if (!connectKit) {
            uiConsole("connectKit not initialized yet");
            return;
        }
        const idToken = "ed";

        const pubkey = "0x";

        const toastId = toast.loading("Validating server-side...");

        // Validate idToken with server
        const loginRequest = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({appPubKey: pubkey}),
        });
        if (loginRequest.status === 200) {
            toast.dismiss(toastId);
            const data = await loginRequest.json();
            setPlayerId(data.player);
            toast.success("JWT Verification Successful");
        } else {
            toast.dismiss(toastId);
            toast.error("JWT Verification Failed");
            console.log("JWT Verification Failed");
            await logout();
        }
        return loginRequest.status;
    };

    const logout = async () => {
        if (!connectKit) {
            uiConsole("connectKit not initialized yet");
            return;
        }
        connectKit.disconnect({hideLoading: true});
    };

    function uiConsole(...args: any[]): void {
        const el = document.querySelector("#console>p");
        if (el) {
            el.innerHTML = JSON.stringify(args || {}, null, 2);
        }
    }

    const loginView = (
        <>
            <div>
                {playerId && (
                    <RegisterButton playerId={playerId} provider={provider} uiConsole={uiConsole} logout={logout} />
                )}
            </div>
            <div>
                {playerId && (
                    <CollectButton playerId={playerId} provider={provider} uiConsole={uiConsole} logout={logout} />
                )}
            </div>
            <div>
                <button onClick={logout} className="card">
                    Log Out
                </button>
            </div>

            <div id="console" style={{whiteSpace: "pre-line", width: "500px", overflowX: "auto"}}>
                <p style={{whiteSpace: "pre-line"}}>Logged in Successfully!</p>
            </div>
        </>
    );

    const logoutView = (
        <>
            <button onClick={login} className="card">
                Login
            </button>
        </>
    );

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: 12,
            }}
        >
            <h1 className="title">
                <a target="_blank" href="https://particle.network" rel="noreferrer">
                    Particle Network
                </a>
                {" & "}
                <a target="_blank" href="https://openfort.xyz" rel="noreferrer">
                    Openfort
                </a>{" "}
                <br />& NextJS Server Side Verification Example
            </h1>

            <Notice />

            <div className="grid">{provider ? loginView : logoutView}</div>

            <footer className="footer">
                <a
                    href="https://github.com/openfort-xyz/samples/tree/main/particle-network-nextjs"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Source code
                </a>
            </footer>
        </div>
    );
}

export default App;
