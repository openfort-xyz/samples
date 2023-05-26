import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "./api/auth/[...nextauth]";

import { getFormData, getItem, setItem } from "../helpers/web";
import { useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { arrayify } from "ethers/lib/utils";
import { useState } from "react";
import { useSession } from "next-auth/react";
// import Openfort from "@openfort/openfort-js";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  return {
    props: {
      session: await getServerSession(req, res, getAuthOptions(req)),
    },
  };
};

// const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY)

const Home: NextPage = () => {
  const { status } = useSession();
  const { data: walletClient } = useWalletClient();
  const [registerLoading, setRegisterLoading] = useState(false);
  const [collectLoading, setCollectLoading] = useState(false);

  const handleRegisterButtonClick = async () => {
    setRegisterLoading(true);

    const wallet = ethers.Wallet.createRandom();
    setItem("session_key", {
      address: wallet.address,
      private_key: wallet.privateKey,
    });
    const address = wallet.address;
    try {
      const sessionResponse = await fetch(`/api/register-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });
      const sessionResponseJSON = await sessionResponse.json();

      if (sessionResponseJSON.data.nextAction) {
        const provider = new ethers.providers.Web3Provider(walletClient as any);
        const signer = provider.getSigner();
        const ownerSignedSession = await signer.signMessage(
          arrayify(sessionResponseJSON.data.nextAction.payload.user_op_hash)
        );
        //const openfortSessionResponse = await openfort.sendSignatureSessionRequest(sessionResponseJSON.data.id, signed_session);

        // -----
        // Code below will be implemented inside the Client SDK
        const pub_key = process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY;
        const formData = getFormData({ signature: ownerSignedSession });
        const openfortSessionResponse = await fetch(
          "https://api.openfort.xyz/v1/sessions/" +
            sessionResponseJSON.data.id +
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
        if (openfortSessionResponse.status === 200) {
          console.log("success:", openfortSessionResponse.body);
          alert("Session created successfully");
        }
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
      const collectResponse = await fetch(`/api/collect`, {
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

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        padding: 12,
      }}
    >
      <ConnectButton showBalance={false} />

      {status === "authenticated" && (
        <div>
          <button
            disabled={registerLoading}
            onClick={handleRegisterButtonClick}
          >
            {registerLoading ? "Registering..." : "Register session key"}
          </button>
          <button disabled={collectLoading} onClick={handleCollectButtonClick}>
            {collectLoading ? "Collecting..." : "Collect item"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
