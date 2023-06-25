import * as React from "react";
import Openfort from "@openfort/openfort-js";
import { useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { arrayify } from "@ethersproject/bytes";

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export function CollectButton() {
  const [collectLoading, setCollectLoading] = React.useState(false);
  const { data: walletClient } = useWalletClient();

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
        let signedTransaction;
        if (await openfort.loadSessionKey()) {
          // sign with the session key
          signedTransaction = openfort.signMessage(
            collectResponseJSON.data.nextAction.payload.user_op_hash
          );
        } else {
          // sign with the owner signer
          const provider = new ethers.providers.Web3Provider(
            walletClient as any
          );
          const signer = provider.getSigner();
          signedTransaction = await signer.signMessage(
            arrayify(collectResponseJSON.data.nextAction.payload.user_op_hash)
          );
        }

        const openfortTransactionResponse =
          await openfort.sendSignatureTransactionIntentRequest(
            collectResponseJSON.data.id,
            signedTransaction
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

  return (
    <div>
      <button
        type="button"
        className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        disabled={collectLoading}
        onClick={handleCollectButtonClick}
      >
        {collectLoading ? "Collecting..." : "Collect item"}
      </button>
    </div>
  );
}
