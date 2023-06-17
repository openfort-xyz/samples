import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { GetServerSideProps, NextPage } from "next";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "./api/auth/[...nextauth]";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Openfort from "@openfort/openfort-js";
import { ethers } from "ethers";
import { arrayify } from "@ethersproject/bytes";
import { useWalletClient } from "wagmi";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  return {
    props: {
      session: await getServerSession(req, res, getAuthOptions(req)),
    },
  };
};

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

const Home: NextPage = () => {
  const { status } = useSession();
  const { data: walletClient } = useWalletClient();
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [collectLoading, setCollectLoading] = useState(false);

  const handleRegisterButtonClick = async () => {
    try {
      setRegisterLoading(true);
      openfort.createSessionKey();
      await openfort.saveSessionKey();
      const address = openfort.sessionKey.address;
      const sessionResponse = await fetch(`/api/register-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });
      const sessionResponseJSON = await sessionResponse.json();

      if (sessionResponseJSON.data?.nextAction) {
        const provider = new ethers.providers.Web3Provider(walletClient as any);
        const signer = provider.getSigner();
        const ownerSignedSession = await signer.signMessage(
          arrayify(sessionResponseJSON.data.nextAction.payload.user_op_hash)
        );

        const openfortSessionResponse =
          await openfort.sendSignatureSessionRequest(
            sessionResponseJSON.data.id,
            ownerSignedSession
          );

        if (openfortSessionResponse) {
          console.log("success:", openfortSessionResponse);
          alert("Session created successfully");
        }
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
      const sessionResponse = await fetch(`/api/revoke-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });
      const sessionResponseJSON = await sessionResponse.json();

      if (sessionResponseJSON.data?.nextAction) {
        const provider = new ethers.providers.Web3Provider(walletClient as any);
        const signer = provider.getSigner();
        const ownerSignedSession = await signer.signMessage(
          arrayify(sessionResponseJSON.data.nextAction.payload.user_op_hash)
        );

        const openfortSessionResponse =
          await openfort.sendSignatureSessionRequest(
            sessionResponseJSON.data.id,
            ownerSignedSession
          );

        if (openfortSessionResponse) {
          localStorage.removeItem("OPENFORT/SESSION-KEY");
          console.log("success:", openfortSessionResponse);
          alert("Session revoked successfully");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setRevokeLoading(false);
    }
  };

  const handleCollectButtonClick = async () => {
    try {
      setCollectLoading(true);
      if (!(await openfort.loadSessionKey())) {
        alert("Session key not found. Please register session key first");
        return;
      }
      const collectResponse = await fetch(`/api/collect`, {
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
          <button disabled={revokeLoading} onClick={handleRevokeButtonClick}>
            {revokeLoading ? "Revoking..." : "Revoke session key"}
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
