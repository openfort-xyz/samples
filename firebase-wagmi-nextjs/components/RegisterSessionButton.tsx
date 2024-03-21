import * as React from "react";
import Openfort from "@openfort/openfort-js";
import { ethers } from "ethers";
import { arrayify } from "@ethersproject/bytes";
import { useWalletClient } from "wagmi";

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

export function RegisterButton() {
  const [registerLoading, setRegisterLoading] = React.useState(false);
  const { data: walletClient } = useWalletClient();

  const handleRegisterButtonClick = async () => {
    try {
      setRegisterLoading(true);
      const sessionKey = openfort.configureSessionKey();
      if (!sessionKey.isRegistered) {
        const address = sessionKey.address;
        const registerResponse = await fetch(
          `/api/examples/protected-register-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ address }),
          }
        );
        const registerResponseJSON = await registerResponse.json();

        if (registerResponseJSON.data?.nextAction) {
          const provider = new ethers.providers.Web3Provider(
            walletClient as any
          );
          const signer = provider.getSigner();
          let signedTransaction = await signer.signMessage(
            arrayify(
              registerResponseJSON.data.nextAction.payload.userOperationHash
            )
          );

          const openfortTransactionResponse =
            await openfort.sendSignatureSessionRequest(
              registerResponseJSON.data.id,
              signedTransaction
            );
          if (openfortTransactionResponse) {
            console.log("success:", openfortTransactionResponse);
            alert("Action performed successfully");
          }
        } else {
          console.log("success:", registerResponseJSON.data);
          alert("Action performed successfully");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        disabled={registerLoading}
        onClick={handleRegisterButtonClick}
      >
        {registerLoading ? "Registering..." : "Register session"}
      </button>
    </div>
  );
}
