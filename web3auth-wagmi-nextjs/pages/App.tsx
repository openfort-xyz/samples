import "react-toastify/dist/ReactToastify.css";

import { getPublicCompressed } from "@toruslabs/eccrypto";
import {
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
  WALLET_ADAPTERS,
} from "@web3auth/base";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Openfort from "@openfort/openfort-js";

import RPC from "../components/evm.ethers";

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

const clientId = process.env.NEXT_PUBLIC_WEB3_AUTH_ID!; // get from https://dashboard.web3auth.io

function App() {
  const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null
  );

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3AuthNoModal({
          clientId,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x13881",
            rpcTarget: "https://rpc.ankr.com/polygon_mumbai",
          },
          web3AuthNetwork: "cyan",
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            loginConfig: {
              google: {
                verifier: "web3auth-google-example",
                typeOfLogin: "google",
                clientId: process.env.NEXT_PUBLIC_GOOGLE_ID, // use your app client id you got from google
              },
            },
          },
        });
        web3auth.configureAdapter(openloginAdapter);
        setWeb3auth(web3auth);
        await web3auth.init();
        if (web3auth.provider) {
          setProvider(web3auth.provider);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      {
        mfaLevel: "default",
        loginProvider: "google",
      }
    );
    setProvider(web3authProvider);
    await validateIdToken();
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const registerSessionKey = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }

    openfort.createSessionKey();
    await openfort.saveSessionKey();
    const address = openfort.sessionKey.address;
    const { idToken } = await web3auth.authenticateUser();
    const privKey: any = await web3auth.provider?.request({
      method: "eth_private_key",
    });
    const pubkey = getPublicCompressed(Buffer.from(privKey, "hex")).toString(
      "hex"
    );
    let toastId = toast.loading("Registering session...");

    const sessionResponse = await fetch("/api/register-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ appPubKey: pubkey, sessionPubKey: address }),
    });
    const sessionResponseJSON = await sessionResponse.json();
    if (sessionResponseJSON.data?.nextAction) {
      toast.dismiss(toastId);
      toastId = toast.loading("Session Key Waiting for Signature");

      const rpc = new RPC(web3auth.provider!);
      const ownerSignedSession = await rpc.signMessage(
        sessionResponseJSON.data.nextAction.payload.user_op_hash
      );

      const openfortSessionResponse =
        await openfort.sendSignatureSessionRequest(
          sessionResponseJSON.data.id,
          ownerSignedSession
        );

      if (openfortSessionResponse) {
        toast.dismiss(toastId);
        console.log("success:", openfortSessionResponse);
        toast.success("Session Key Registered Successfully");
      }
    } else {
      toast.dismiss(toastId);
      toast.error("Session Key Registration Failed");
    }
  };

  const mintAsset = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const { idToken } = await web3auth.authenticateUser();

    if (!(await openfort.loadSessionKey())) {
      toast.error("Session key not found. Please register session key first");
      return;
    }
    const privKey: any = await web3auth.provider?.request({
      method: "eth_private_key",
    });

    const pubkey = getPublicCompressed(Buffer.from(privKey, "hex")).toString(
      "hex"
    );
    let toastId = toast.loading("Collecting item...");
    // Validate idToken with server
    const collectResponse = await fetch("/api/collect-asset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ appPubKey: pubkey, item: 22, player: 1212 }),
    });
    const collectResponseJSON = await collectResponse.json();
    if (collectResponseJSON.data?.nextAction) {
      const sessionSignedTransaction = openfort.signMessage(
        collectResponseJSON.data.nextAction.payload.user_op_hash
      );
      toast.dismiss(toastId);
      toastId = toast.loading("Session Key Waiting for Signature");
      const openfortTransactionResponse =
        await openfort.sendSignatureTransactionIntentRequest(
          collectResponseJSON.data.id,
          sessionSignedTransaction
        );
      if (openfortTransactionResponse) {
        toast.dismiss(toastId);
        toast.success("Item Collected Successfully");
      }
    } else {
      toast.dismiss(toastId);
      toast.error("JWT Verification Failed");
      await logout();
    }
    return collectResponseJSON;
  };

  const validateIdToken = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const { idToken } = await web3auth.authenticateUser();

    const privKey: any = await web3auth.provider?.request({
      method: "eth_private_key",
    });

    const pubkey = getPublicCompressed(Buffer.from(privKey, "hex")).toString(
      "hex"
    );

    const toastId = toast.loading("Validating server-side...");

    // Validate idToken with server
    const loginRequest = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ appPubKey: pubkey }),
    });
    if (loginRequest.status === 200) {
      toast.dismiss(toastId);
      toast.success("JWT Verification Successful");

    } else {
      toast.dismiss(toastId);
      toast.error("JWT Verification Failed");
      console.log("JWT Verification Failed");
      await logout();
    }
    return loginRequest.status;
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const loginView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={registerSessionKey} className="card">
            Register session key
          </button>
        </div>
        <div>
          <button onClick={mintAsset} className="card">
            Collect item
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>

      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}>Logged in Successfully!</p>
      </div>
    </>
  );

  const logoutView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="https://web3auth.io/" rel="noreferrer">
          Web3Auth
        </a>
        {" & "}
        <a target="_blank" href="https://openfort.xyz" rel="noreferrer">
          Openfort
        </a>{" "}
        & NextJS Server Side Verification Example
      </h1>

      <div className="grid">{provider ? loginView : logoutView}</div>

      <footer className="footer">
        <a
          href="https://github.com/openfort-xyz/samples/tree/main/web3auth-wagmi-nextjs"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
      </footer>
    </div>
  );
}

export default App;
