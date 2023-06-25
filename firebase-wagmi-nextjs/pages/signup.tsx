import type { NextPage } from "next";
import Head from "next/head";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCustomToken,
} from "firebase/auth";
import { useState } from "react";
import { useAuth } from "../lib/authContext";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useConnect, useSignMessage } from "wagmi";

const Home: NextPage = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { signMessageAsync } = useSignMessage();
  const [connectLoading, setConnectLoading] = useState(false);

  const { connect } = useConnect({
    connector: new InjectedConnector(),
    onSuccess(data, variables, context) {
      loginWithWallet(data.account);
    },
  });

  if (loading) return null;

  if (user)
    return (
      <div className="flex space-x-2">
        <h1>{"You already logged. Head to "}</h1>
        <a href="/private" className="underline text-blue-600">
          /Private
        </a>
      </div>
    );

  const auth = getAuth();

  function createUserCredentials() {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ...
        console.log("success", user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("error", errorMessage);
        window.alert(errorMessage);
        // ..
      });
  }

  function loginWithGoogle() {
    const googleProvider = new GoogleAuthProvider();

    signInWithPopup(auth, googleProvider)
      .then(async (result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        await fetch("/api/examples/protected-user", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        console.log("sign with google", user);
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("error", errorMessage);
        window.alert(errorMessage);
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  async function loginWithWallet(account: string) {
    connect();
    setConnectLoading(true);
    const nonceResponse = await fetch("/api/get-nonce", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: account,
      }),
    });

    const nonceData = await nonceResponse.json();

    const signature = await signMessageAsync({
      message: nonceData.nonce,
    });

    return fetch("/api/create-session", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signedMessage: signature,
        address: account,
      }),
    })
      .then(async (result: Response) => {
        const tokenData = await result.json();

        signInWithCustomToken(auth, tokenData.token)
          .then((userCredential) => {
            // Signed in
            setConnectLoading(false);
            const user = userCredential.user;
            console.log("sign with wallet", user);
            // ...
          })
          .catch((error) => {
            setConnectLoading(false);
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("error", errorMessage);
            window.alert(errorMessage);
          });
      })
      .catch((error) => {
        setConnectLoading(false);
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("error", errorMessage);
        window.alert(errorMessage);
      });
  }

  return (
    <>
      <Head>
        <title>Signup</title>
      </Head>

      <div className="m-auto my-24 w-1/3 h-1/3 divide-y-4 space-y-1">
        <div className="space-y-1">
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            className="border border-current	"
          />
          <br />
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            className="border border-current	"
          />
          <br />
          <button onClick={createUserCredentials}>Signup</button>
        </div>
        <div>
          <button onClick={() => loginWithGoogle()}>Login with Google</button>
        </div>
        <div>
          <button disabled={connectLoading} onClick={() => connect()}>
            {connectLoading ? "Connecting ... " : "Connect Wallet"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
