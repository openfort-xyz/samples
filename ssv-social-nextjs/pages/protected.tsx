import {useState, useEffect} from "react";
import {useSession} from "next-auth/react";
import Layout from "../components/layout";
import AccessDenied from "../components/access-denied";
import Openfort from "@openfort/openfort-js";
import {useAccount, useConnect, useDisconnect} from "wagmi";
import {InjectedConnector} from "wagmi/connectors/injected";
import {AcceptOwnership} from "../components/accept-ownership";

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export default function ProtectedPage() {
    const [requestTransferOwnership, setRequestTransferOwnership] = useState(null);
    const {address, isConnected} = useAccount();
    const {connect} = useConnect({
        connector: new InjectedConnector(),
    });
    const {disconnect} = useDisconnect();
    const {data: session} = useSession();
    const [content, setContent] = useState();
    const [registerLoading, setRegisterLoading] = useState(false);

    const [collectLoading, setCollectLoading] = useState(false);
    const [transferOwnershipLoading, setTransferOwnershipLoading] = useState(false);

    // Fetch content from protected route
    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("/api/examples/protected");
            const json = await res.json();
            if (json.content) {
                setContent(json.content);
            }
        };
        fetchData();
    }, [session]);

    const handleRegisterButtonClick = async () => {
        try {
            setRegisterLoading(true);
            const sessionKey = openfort.configureSessionKey();
            if (!sessionKey.isRegistered) {
                const address = sessionKey.address;
                const sessionResponse = await fetch(`/api/examples/protected-register-session`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({address}),
                });
                const sessionResponseJSON = await sessionResponse.json();
                console.log("success:", sessionResponseJSON);
                if (sessionResponseJSON.data) {
                    alert("Session created successfully");
                }
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleCollectButtonClick = async () => {
        try {
            setCollectLoading(true);

            const collectResponse = await fetch(`/api/examples/protected-collect`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const collectResponseJSON = await collectResponse.json();

            if (collectResponseJSON.data?.nextAction) {
                const sessionKey = openfort.configureSessionKey();

                const openfortTransactionResponse = await openfort.sendSignatureTransactionIntentRequest(
                    collectResponseJSON.data.id,
                    collectResponseJSON.data.nextAction.payload.userOperationHash,
                );
                if (openfortTransactionResponse) {
                    console.log("success:", openfortTransactionResponse);
                    alert("Action performed successfully");
                }
            } else {
                console.log("success:", collectResponseJSON.data);
                alert("Action performed successfully");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setCollectLoading(false);
        }
    };

    const handleTransaferOwnershipButtonClick = async () => {
        try {
            setTransferOwnershipLoading(true);
            const sessionKey = openfort.configureSessionKey();
            if (!sessionKey.isRegistered) {
                alert("Session key not found. Please register session key first");
                return;
            }
            // Set to the address you want to transfer ownership to
            const newOwnerAddress = "0x9590Ed0C18190a310f4e93CAccc4CC17270bED40";
            const transagerResponse = await fetch(`/api/examples/protected-transfer-ownership`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    address: newOwnerAddress,
                }),
            });
            const response = await transagerResponse.json();
            console.log("success:", response.data.tranferRequest);
            if (response.data.tranferRequest) {
                alert("Request sent successfully");
                setRequestTransferOwnership(response.data.accountAddress);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setTransferOwnershipLoading(false);
        }
    };

    // If no session exists, display access denied message
    if (!session) {
        return (
            <Layout>
                <AccessDenied />
            </Layout>
        );
    }

    // If session exists, display content
    return (
        <Layout>
            <h1>Protected Page</h1>
            <p>
                <strong>{content ?? "\u00a0"}</strong>
            </p>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    maxWidth: "300px",
                }}
            >
                <button style={{margin: "10px"}} disabled={collectLoading} onClick={handleCollectButtonClick}>
                    {collectLoading ? "Minting..." : "Mint NFT"}
                </button>
                <button style={{margin: "10px"}} disabled={registerLoading} onClick={handleRegisterButtonClick}>
                    {registerLoading ? "Registering..." : "Register session key"}
                </button>
            </div>
            <p>{"Transfer ownership is disabled in live demo."}</p>
            {!requestTransferOwnership ? (
                <button
                    style={{margin: "10px"}}
                    disabled={transferOwnershipLoading || true}
                    // Remove disabled to enable transfer ownership
                    onClick={handleTransaferOwnershipButtonClick}
                >
                    {transferOwnershipLoading ? "Requesting..." : "Request account custody"}
                </button>
            ) : isConnected ? (
                <div>
                    <p>
                        <small>Connected to signer with address: {address}</small>
                    </p>
                    <AcceptOwnership accountAddress={requestTransferOwnership!} />
                    <button style={{marginTop: "20px"}} onClick={() => disconnect()}>
                        Disconnect Wallet
                    </button>
                </div>
            ) : (
                <button style={{marginTop: "20px", marginLeft: "10px"}} onClick={() => connect()}>
                    Connect Wallet
                </button>
            )}
        </Layout>
    );
}
