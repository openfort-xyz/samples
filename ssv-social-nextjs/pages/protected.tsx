import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Layout from "../components/layout";
import AccessDenied from "../components/access-denied";
import { computeAddress } from "ethers/lib/utils";
import Openfort from "@openfort/openfort-js";

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export default function ProtectedPage() {
  const { data: session } = useSession();
  const [content, setContent] = useState();
  const [registerLoading, setRegisterLoading] = useState(false);
  const [collectLoading, setCollectLoading] = useState(false);

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
      await openfort.saveSessionKeyToLocalStorage();
      const address = computeAddress(openfort.keyPair.publicKey);
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

  const handleCollectButtonClick = async () => {
    try {
      setCollectLoading(true);
      if(!(await openfort.loadSessionKeyFromLocalStorage())){
        alert("Session key not found. Please register session key first");
        return;
      }
      const collectResponse = await fetch(`/api/examples/protected-collect`, {
        method: "GET",
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
          alert("Asset collected successfully");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCollectLoading(false);
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
      <button disabled={registerLoading} onClick={handleRegisterButtonClick}>
        {registerLoading ? "Registering..." : "Register session key"}
      </button>
      <button disabled={collectLoading} onClick={handleCollectButtonClick}>
        {collectLoading ? "Collecting..." : "Collect item"}
      </button>
    </Layout>
  );
}
