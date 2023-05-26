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

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  return {
    props: {
      session: await getServerSession(req, res, getAuthOptions(req)),
    },
  };
};

export const MessagePrefix: string = "\x19Ethereum Signed Message:\n";

const Home: NextPage = () => {
  const { status } = useSession();

  const { data: walletClient } = useWalletClient();

  // Add states for the buttons
  const [registerLoading, setRegisterLoading] = useState(false);
  const [collectLoading, setCollectLoading] = useState(false);

  const handleRegisterButtonClick = async () => {
    setRegisterLoading(true); // Set loading state to true when request starts

    const wallet = ethers.Wallet.createRandom();
    setItem("session_key", {
      address: wallet.address,
      private_key: wallet.privateKey,
    });
    const address = wallet.address;
    try {
      const res = await fetch(`/api/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });
      const response = await res.json();

      if (response.data.nextAction) {
        const provider = new ethers.providers.Web3Provider(walletClient as any);
        const signer = provider.getSigner();
        const result = await signer.signMessage(
          arrayify(response.data.nextAction.payload.user_op_hash)
        );
        // -----
        // Code below will be implemented inside the Client SDK
        const pub_key = process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY;
        const formData = getFormData({ signature: result });
        const res_session = await fetch(
          "https://api.openfort.xyz/v1/sessions/" +
            response.data.id +
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
        if (res_session.status === 200) {
          console.log("success:", res_session);
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
      const res = await fetch(`/api/collect`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await res.json();
      if (response.data.nextAction) {

        const wallet = new ethers.Wallet(wallet_imported.private_key);
        const result = await wallet.signMessage(
          arrayify(response.data.nextAction.payload.user_op_hash)
        );
        // -----
        // Code below will be implemented inside the Client SDK
        const pub_key = process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY;
        const formData = getFormData({ signature: result });

        const res_transaction = await fetch(
          "https://api.openfort.xyz/v1/transaction_intents/" +
            response.data.id +
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
        if (res_transaction.status === 200) {
          console.log("success:", res_transaction);
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
