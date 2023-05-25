import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "./api/auth/[...nextauth]";

import { getFormData, getItem, setItem } from "../helpers/web";
import { useSignMessage } from "wagmi";
import { ethers } from "ethers";
import { arrayify } from "ethers/lib/utils";
import { useState } from "react";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  return {
    props: {
      session: await getServerSession(req, res, getAuthOptions(req)),
    },
  };
};

const Home: NextPage = (props: any) => {
  const { signMessageAsync } = useSignMessage();
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

      if (response.data.next_action) {
        const result = await signMessageAsync({
          message: response.data.next_action.payload.user_op_hash,
        });

        const pub_key = process.env.NEXTAUTH_OPENFORT_PUBLIC_KEY;
        const formData = getFormData({ signature: result });

        const res_session = await fetch(
          "http://localhost:3000/v1/sessions/" +
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
        if (res_session.status === 200) {
          console.log("success");
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
        method: "GET", // or 'POST', 'PUT', etc.
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await res.json();
      if (response.data.next_action) {
        // -----
        // Code below will be implemented inside the Client SDK
        const wallet = new ethers.Wallet(wallet_imported.private_key);
        const result = await wallet.signMessage(
          arrayify(response.data.next_action.payload.user_op_hash)
        );
        const pub_key = process.env.NEXTAUTH_OPENFORT_PUBLIC_KEY;
        const formData = getFormData({ signature: result });

        const res_session = await fetch(
          "http://localhost:3000/v1/transaction_intents/" +
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
          console.log("success");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      // Remember to set loading state to false in a finally block to ensure it's executed no matter what
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

      {props.session && (
        <div>
          <button
            disabled={registerLoading}
            onClick={handleRegisterButtonClick}
          >
            {" "}
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
