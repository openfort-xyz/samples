import * as React from "react";
import Openfort from "@openfort/openfort-js";
import { ethers } from "ethers";
import { arrayify } from "@ethersproject/bytes";
import { useWalletClient } from "wagmi";

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export function RevokeButton() {
  const [revokeLoading, setRevokeLoading] = React.useState(false);
  const { data: walletClient } = useWalletClient();

  const handleRevokeButtonClick = async () => {
    try {
      const sessionKey = openfort.configureSessionKey();
      if (!sessionKey.isRegistered) {
        alert("Session key not found. Please register session key first");
        return;
      }
      setRevokeLoading(true);
      const address = sessionKey.address;

      const revokeResponse = await fetch(
        `/api/examples/protected-revoke-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
        }
      );
      const revokeResponseJSON = await revokeResponse.json();

      if (revokeResponseJSON.data?.nextAction) {
        const provider = new ethers.providers.Web3Provider(walletClient as any);
        const signer = provider.getSigner();
        let signedTransaction = await signer.signMessage(
          arrayify(revokeResponseJSON.data.nextAction.payload.userOperationHash)
        );

        const openfortTransactionResponse =
          await openfort.sendSignatureSessionRequest(
            revokeResponseJSON.data.id,
            signedTransaction
          );
        if (openfortTransactionResponse) {
          openfort.logout();
          console.log("success:", openfortTransactionResponse);
          alert("Action performed successfully");
        }
      } else {
        console.log("success:", revokeResponseJSON.data);
        alert("Action performed successfully");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setRevokeLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        disabled={revokeLoading}
        onClick={handleRevokeButtonClick}
      >
        {revokeLoading ? "Revoke..." : "Revoke item"}
      </button>
    </div>
  );
}
