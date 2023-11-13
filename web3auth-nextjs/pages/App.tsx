import "react-toastify/dist/ReactToastify.css";

import {getPublicCompressed} from "@toruslabs/eccrypto";
import {CHAIN_NAMESPACES, SafeEventEmitterProvider, WALLET_ADAPTERS} from "@web3auth/base";
import {Web3AuthNoModal} from "@web3auth/no-modal";
import {OpenloginAdapter} from "@web3auth/openlogin-adapter";
import {useEffect, useState} from "react";
import {toast} from "react-toastify";

import Notice from "../components/Notice";
import {CollectButton} from "../components/CollectButton";
import {RegisterButton} from "../components/RegisterSessionButton";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

const clientId = process.env.NEXT_PUBLIC_WEB3_AUTH_ID!; // get from https://dashboard.web3auth.io

function App() {
    const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
    const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [loggedIn, setLoggedIn] = useState<boolean | null>(false);

    useEffect(() => {
        const init = async () => {
            try {
                const chainConfig = {
                    chainNamespace: CHAIN_NAMESPACES.EIP155,
                    chainId: "0x1",
                    rpcTarget: "https://rpc.ankr.com/eth",
                    displayName: "Ethereum Mainnet",
                    blockExplorer: "https://goerli.etherscan.io",
                    ticker: "ETH",
                    tickerName: "Ethereum",
                  };
                const web3auth = new Web3AuthNoModal({
                    clientId,
                    chainConfig: chainConfig,
                    web3AuthNetwork: "sapphire_devnet",
                });

                const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

                const openloginAdapter = new OpenloginAdapter({
                    adapterSettings: {
                        loginConfig: {
                            google: {
                                verifier: "openfort-web3auth-sample-google",
                                typeOfLogin: "google",
                                clientId: process.env.NEXT_PUBLIC_GOOGLE_ID, // use your app client id you got from google
                            },
                        },
                    },
                    privateKeyProvider
                });
                web3auth.configureAdapter(openloginAdapter);
                setWeb3auth(web3auth);
                await web3auth.init();
                setProvider(web3auth.provider);
                if (web3auth.connectedAdapterName) {
                    setLoggedIn(true);
                  }
            } catch (error) {
                console.error(error);
            }
        };

        init();
    }, []);

    const login = async () => {
        if (!web3auth) {
            uiConsole("web3auth not initialized yet");
            return;
        }
        const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
            mfaLevel: "default",
            loginProvider: "google",
        });
        setProvider(web3authProvider);
        await validateIdToken();
        setLoggedIn(true);
    };

    const getUserInfo = async () => {
        if (!web3auth) {
            uiConsole("web3auth not initialized yet");
            return;
        }
        const user = await web3auth.getUserInfo();
        uiConsole(user);
    };

    const validateIdToken = async () => {
        if (!web3auth) {
            uiConsole("web3auth not initialized yet");
            return;
        }
        const {idToken} = await web3auth.authenticateUser();

        const privKey: any = await web3auth.provider?.request({
            method: "eth_private_key",
        });

        const pubkey = getPublicCompressed(Buffer.from(privKey, "hex")).toString("hex");

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
        if (!web3auth) {
            uiConsole("web3auth not initialized yet");
            return;
        }
        await web3auth.logout();
        setProvider(null);
        setLoggedIn(false);
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
                    <RegisterButton playerId={playerId} web3auth={web3auth} uiConsole={uiConsole} logout={logout} />
                )}
            </div>
            <div>
                {playerId && (
                    <CollectButton playerId={playerId} web3auth={web3auth} uiConsole={uiConsole} logout={logout} />
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
        <button onClick={login} className="card">
            Login
        </button>
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
                <a target="_blank" href="https://web3auth.io/" rel="noreferrer">
                    Web3Auth
                </a>
                {" & "}
                <a target="_blank" href="https://openfort.xyz" rel="noreferrer">
                    Openfort
                </a>{" "}
                <br />& NextJS Server Side Verification Example
            </h1>

            <Notice />

            <div className="grid">{loggedIn ? loginView : logoutView}</div>

            <footer className="footer">
                <a
                    href="https://github.com/openfort-xyz/samples/tree/main/web3auth-nextjs"
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
