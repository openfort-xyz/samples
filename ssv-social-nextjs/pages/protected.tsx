import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Layout from "../components/layout";
import AccessDenied from "../components/access-denied";
import { ethers } from "ethers";
import { arrayify } from "ethers/lib/utils";
import { getFormData, getItem, setItem } from "../helpers/web";
// import Openfort from "@openfort/openfort-js";

// const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY)

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
    setRegisterLoading(true);

    const wallet = ethers.Wallet.createRandom();
    setItem("session_key", {
      address: wallet.address,
      private_key: wallet.privateKey,
    });
    const address = wallet.address;
    try {
      const sessionResponse = await fetch(`/api/examples/protected-register-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });
      const sessionResponseJSON = await sessionResponse.json();
      console.log(sessionResponseJSON)
      if(sessionResponseJSON.data){
        alert("Session created successfully");
      }

    } catch (error) {
      console.error("Error:", error);
    } finally {
      // Remember to set loading state to false in a finally block to ensure it's executed no matter what
      setRegisterLoading(false);
    }
  };

  const handleCollectButtonClick = async () => {
    setCollectLoading(true); // Set loading state to true when request starts

    const wallet_imported = getItem("session_key");
    try {
      const collectResponse = await fetch(`/api/examples/protected-collect`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const collectResponseJSON = await collectResponse.json();
      if (collectResponseJSON.data.nextAction) {
        const wallet = new ethers.Wallet(wallet_imported.private_key);
        const sessionSignedTransaction = await wallet.signMessage(
          arrayify(collectResponseJSON.data.nextAction.payload.user_op_hash)
        );
        //const openfortTransactionResponse= await openfort.sendSignatureSessionRequest(collectResponseJSON.data.id, signed_session);

        // -----
        // Code below will be implemented inside the Client SDK
        const pub_key = process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY;
        const formData = getFormData({ signature: sessionSignedTransaction });
        const openfortTransactionResponse = await fetch(
          "https://api.openfort.xyz/v1/transaction_intents/" +
            collectResponseJSON.data.id +
            "/signature",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${pub_key}`,
            },
            body: formData,
          }
        );
        // -----
        if (openfortTransactionResponse.status === 200) {
          console.log("success:", openfortTransactionResponse.body);
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
