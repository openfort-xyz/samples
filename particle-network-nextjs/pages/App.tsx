import "react-toastify/dist/ReactToastify.css";

import {useEffect, useState} from "react";
import {toast} from "react-toastify";
import Notice from "../components/Notice";
import {CollectButton} from "../components/CollectButton";
import {RegisterButton} from "../components/RegisterSessionButton";
import {ParticleNetwork} from "@particle-network/auth";
import {ParticleProvider} from "@particle-network/provider";

function App() {
    const [particle, setParticle] = useState<ParticleNetwork | null>(null);
    const [provider, setProvider] = useState<ParticleProvider | null>(null);
    useEffect(() => {
        const init = async () => {
            try {
                const particle = new ParticleNetwork({
                    projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
                    clientKey: process.env.NEXT_PUBLIC_CLIENT_KEY as string,
                    appId: process.env.NEXT_PUBLIC_APP_ID as string,
                });
                setParticle(particle);
            } catch (error) {
                console.error(error);
            }
        };

        init();
    }, []);

    const [playerId, setPlayerId] = useState<string | null>(null);

    const login = async () => {
        if (!particle) {
            uiConsole("particle not initialized yet");
            return;
        }
        await particle.auth.login({preferredAuthType: "google"});
        const particleProvider = new ParticleProvider(particle.auth);
        setProvider(particleProvider);
        await validateIdToken();
    };

    const getUserInfo = async () => {
        if (!particle) {
            uiConsole("Particle not initialized yet");
            return;
        }
        const user = particle.auth.getUserInfo();
        uiConsole(user);
    };

    const validateIdToken = async () => {
        if (!particle) {
            uiConsole("particle not initialized yet");
            return;
        }
        const authInfo = particle.auth.getUserInfo();

        if (!authInfo) {
            toast.error("JWT Verification Failed");
            console.log("JWT Verification Failed");
            await logout();
            return;
        }

        const toastId = toast.loading("Validating server-side...");

        // Validate idToken with server
        const loginRequest = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authInfo.token}`,
            },
            body: JSON.stringify({user_uuid: authInfo.uuid}),
        });
        if (loginRequest.status === 200) {
            toast.dismiss(toastId);
            const data = await loginRequest.json();
            setPlayerId(data.player);
            toast.success("JWT Verification Successful");
        } else {
            console.log(loginRequest);
            toast.dismiss(toastId);
            toast.error("JWT Verification Failed");
            console.log("JWT Verification Failed");
            await logout();
        }
        return loginRequest.status;
    };

    const logout = async () => {
        if (!particle) {
            uiConsole("particle not initialized yet");
            return;
        }
        setProvider(null);
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
                <button onClick={getUserInfo} className="card">
                    Get User Info
                </button>
            </div>
            <div>
                {playerId && (
                    <RegisterButton
                        playerId={playerId}
                        particle={particle}
                        provider={provider}
                        uiConsole={uiConsole}
                        logout={logout}
                    />
                )}
            </div>
            <div>
                {playerId && (
                    <CollectButton
                        playerId={playerId}
                        particle={particle}
                        provider={provider}
                        uiConsole={uiConsole}
                        logout={logout}
                    />
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
