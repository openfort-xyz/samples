import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Layout from "../components/layout";
import AccessDenied from "../components/access-denied";
import Openfort from "@openfort/openfort-js";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { AcceptOwnership } from "../components/accept-ownership";

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export default function ProtectedPage() {
  const [requestTransferOwnership, setRequestTransferOwnership] =
    useState(null);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const { data: session } = useSession();
  const [content, setContent] = useState();
  const [registerLoading, setRegisterLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [collectLoading, setCollectLoading] = useState(false);
  const [transferOwnershipLoading, setTransferOwnershipLoading] =
    useState(false);
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
      openfort.createSessionKey();
      await openfort.saveSessionKey();
      const address = openfort.sessionKey.address;
      const sessionResponse = await fetch(
        `/api/examples/protected-register-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
        }
      );
      const sessionResponseJSON = await sessionResponse.json();
      console.log("success:", sessionResponseJSON);
      if (sessionResponseJSON.data) {
        alert("Session created successfully");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleRevokeButtonClick = async () => {
    try {
      setRevokeLoading(true);
      if (!(await openfort.loadSessionKey())) {
        alert("Session key not found. Please register session key first");
        return;
      }
      const address = openfort.sessionKey.address;
      const sessionResponse = await fetch(
        `/api/examples/protected-revoke-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
        }
      );
      const sessionResponseJSON = await sessionResponse.json();
      if (sessionResponseJSON.data) {
        localStorage.removeItem("OPENFORT/SESSION-KEY");
        console.log("success:", sessionResponseJSON);

        alert("Session revoked successfully");
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
      if (!(await openfort.loadSessionKey())) {
        alert("Session key not found. Please register session key first");
        return;
      }
      const collectResponse = await fetch(`/api/examples/protected-collect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const collectResponseJSON = await collectResponse.json();

      if (collectResponseJSON.data?.nextAction) {
        const sessionSignedTransaction = openfort.signMessage(
          collectResponseJSON.data.nextAction.payload.user_op_hash
        );
        const openfortTransactionResponse =
          await openfort.sendSignatureTransactionIntentRequest(
            collectResponseJSON.data.id,
            sessionSignedTransaction
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
      if (!(await openfort.loadSessionKey())) {
        alert("Session key not found. Please register session key first");
        return;
      }
      const newOwnerAddress = "0x9590Ed0C18190a310f4e93CAccc4CC17270bED40";
      const transagerResponse = await fetch(
        `/api/examples/protected-transfer-ownership`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: newOwnerAddress,
          }),
        }
      );
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
        <button
          style={{ margin: "10px" }}
          disabled={registerLoading}
          onClick={handleRegisterButtonClick}
        >
          {registerLoading ? "Registering..." : "Register session key"}
        </button>
        <button
          style={{ margin: "10px" }}
          disabled={revokeLoading}
          onClick={handleRevokeButtonClick}
        >
          {revokeLoading ? "Revoking..." : "Revoke session key"}
        </button>
        <button
          style={{ margin: "10px" }}
          disabled={collectLoading}
          onClick={handleCollectButtonClick}
        >
          {collectLoading ? "Collecting..." : "Collect item"}
        </button>
      </div>
      {!requestTransferOwnership ? (
        <button
          style={{ margin: "10px" }}
          disabled={transferOwnershipLoading}
          onClick={handleTransaferOwnershipButtonClick}
        >
          {transferOwnershipLoading
            ? "Requesting..."
            : "Request account custody"}
        </button>
      ) : isConnected ? (
        <div>
          <p>
            <small>Connected to signer with address: {address}</small>
          </p>
          <AcceptOwnership accountAddress={requestTransferOwnership!} />
          <button style={{ marginTop: "20px" }} onClick={() => disconnect()}>
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <button
          style={{ marginTop: "20px", marginLeft: "10px" }}
          onClick={() => connect()}
        >
          Connect Wallet
        </button>
      )}
    </Layout>
  );
}
