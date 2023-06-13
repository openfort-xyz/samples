import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { TextField } from "@/components/Fields";
import Head from "next/head";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Success from "@/components/Success";
import Error from "@/components/Error";
import { Loading } from "@/components/Loading";
import jwt from "jsonwebtoken";
import { getGoogleUrl } from "@/utils/getGoogleUrl";

interface AuthProps {
  redirect_uri: string | null;
  game: string | null;
  jwtToken: string | null;
}

export type AuthResponse = {
  player: string;
  token: string;
};

const Auth: NextPage<AuthProps> = ({ redirect_uri, game, jwtToken }) => {
  const [show, setShow] = useState(false);
  const [loadingState, setLoadingState] = useState(false);

  const [registrationMode, setRegistrationMode] = useState(false);
  const router = useRouter();
  const [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);
  const [errorResponse, setErrorResponse] = useState<boolean>(false);

  useEffect(() => {
    let localToken;
    if (jwtToken) {
      localStorage.setItem("jwtToken", jwtToken);
      localToken = jwtToken;
    } else {
      localToken = localStorage.getItem("jwtToken");
    }

    if (localToken) {
      setLoadingState(true);
      try {
        jwt.verify(localToken, process.env.NEXT_PUBLIC_JWT_SECRET!);
        const decodedToken = jwt.decode(localToken);
        if (
          typeof decodedToken === "object" &&
          decodedToken !== null &&
          "userId" in decodedToken
        ) {
          const player = decodedToken["userId"];
          if (player) {
            if (redirect_uri) {
              router.push(`${redirect_uri}?token=${localToken}&player=${player}`);
            } else if (window.opener) {
              window.opener.postMessage(
                {
                  token: localToken,
                },
                process.env.NEXT_PUBLIC_SAMPLE_OAUTH_INTEGRATION_URL
              );
              router.replace(`?game=${game}&token=${localToken}&player=${player}`);
              window.close();
            }
            setAuthResponse({ player: player, token: localToken });
            setLoadingState(false);
            return;
          }
        }
      } catch (err: any) {
        setLoadingState(false);
        console.log("Token is invalid: " + err.message);
        localStorage.removeItem("jwtToken");
        return;
      }
    }
  }, []);

  const handleSubmitSignIn = async (event: any) => {
    event.preventDefault();
    setLoadingState(true);
    setErrorResponse(false);
    const email = event.target.email.value;
    const password = event.target.password.value;

    const authResponse = await fetch(
      process.env.NEXT_PUBLIC_ECOSYSTEM_BACKEND_URL + "auth/signin",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    if (authResponse.ok) {
      setLoadingState(false);
      const authResponseJSON = await authResponse.json();
      localStorage.setItem("jwtToken", authResponseJSON.token);
      if (redirect_uri) {
        router.push(
          `${redirect_uri}?token=${authResponseJSON.token}&player=${authResponseJSON.player}`
        );
      } else if (window.opener) {
        window.opener.postMessage(
          {
            token: authResponseJSON.token,
          },
          process.env.NEXT_PUBLIC_SAMPLE_OAUTH_INTEGRATION_URL
        );
        router.replace(
          `?game=${game}&token=${authResponseJSON.token}&id=${authResponseJSON.player}`
        );
        window.close();
      }
      setAuthResponse(authResponseJSON);
    } else {
      setErrorResponse(true);
      setLoadingState(false);
    }
  };

  const handleSubmitRegister = async (event: any) => {
    event.preventDefault();
    setLoadingState(true);
    setErrorResponse(false);
    const email = event.target.email.value;
    const password = event.target.password.value;

    const authResponse = await fetch(
      process.env.NEXT_PUBLIC_ECOSYSTEM_BACKEND_URL + "auth/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, game }),
      }
    );

    if (authResponse.ok) {
      setLoadingState(false);
      const authResponseJSON = await authResponse.json();
      localStorage.setItem("jwtToken", authResponseJSON.token);
      if (redirect_uri) {
        router.push(
          `${redirect_uri}?token=${authResponseJSON.token}&player=${authResponseJSON.player}`
        );
      } else if (window.opener) {
        window.opener.postMessage(
          {
            token: authResponseJSON.token,
          },
          process.env.NEXT_PUBLIC_SAMPLE_OAUTH_INTEGRATION_URL
        );
        router.replace(
          `?game=${game}&token=${authResponseJSON.token}&player=${authResponseJSON.player}`
        );
        window.close();
      }
      setAuthResponse(authResponseJSON);
    } else {
      setErrorResponse(true);
      setLoadingState(false);
    }
  };

  if (!game && !authResponse) {
    return <Error message="Missing game" />;
  }

  if (loadingState) {
    return <Loading />;
  }

  if (authResponse) {
    return <Success />;
  }

  if (registrationMode)
    return (
      <>
        <Head>
          <title>Register With X</title>
        </Head>
        <div className="flex min-h-full flex-1 flex-col justify-center overflow-hidden bg-white sm:py-28">
          <div className="mx-auto flex w-full max-w-xl flex-col px-4 sm:px-6">
            <div className="-mx-4 flex-auto py-10 px-8 sm:mx-0 sm:flex-none sm:rounded-md sm:p-14">
              <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
                <img
                  className="mx-auto h-20 w-auto rounded-md"
                  src={
                    "https://cdn-icons-png.flaticon.com/512/896/896091.png"
                  }
                  alt={"Bouncy Logo"}
                />
              </div>
              <div className="relative mb-6">
                <h1 className="text-left text-2xl font-semibold tracking-tight text-gray-900">
                  {"Register with X"}
                </h1>
              </div>
              <form onSubmit={handleSubmitRegister}>
                <div className="space-y-6">
                  <TextField label="Email address" id="email" type="email" />
                  <TextField
                    label="Password"
                    id="password"
                    show={show}
                    setShow={setShow}
                    type="password"
                  />
                  {errorResponse && (
                    <Error message="Invalid email or password. Please, try again." />
                  )}
                  <div className="flex w-full flex-row-reverse ">
                    <Button
                      variant="text"
                      href="#"
                      className="text-sm font-medium text-orange-600"
                    >
                      Forgot password?
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  color="orange"
                  className="mt-8 w-full py-2"
                >
                  Register
                </Button>
              </form>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div>
                    <button
                      onClick={() => {
                        router.push(getGoogleUrl(redirect_uri || null, game || null));
                      }}
                      className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Continue with Google</span>
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />{" "}
                      </svg>
                    </button>
                  </div>

                  <div>
                    <button
                      onClick={() => {}}
                      className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Continue with GitHub</span>
                      <svg
                        className="h-5 w-5"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="inline-flex my-5 space-x-2 w-full">
                  <p className="text-sm text-gray-500">Have an account? </p>
                  <Button
                    variant="text"
                    onClick={() => {
                      setRegistrationMode(false);
                    }}
                    className="text-orange-500"
                  >
                    Sign in
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );

  return (
    <>
      <Head>
        <title>Sign In With X</title>
      </Head>
      <div className="flex bg-white  min-h-full overflow-hidden sm:py-28">
        <div className="mx-auto flex w-full max-w-xl flex-col px-4 sm:px-6">
          <div className="-mx-4 flex-auto py-10 px-8 sm:mx-0 sm:flex-none sm:rounded-md sm:p-14">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
              <img
                className="mx-auto h-20 w-auto rounded-md"
                src={
                  "https://cdn-icons-png.flaticon.com/512/896/896091.png"
                }
                alt={"Bouncy Logo"}
              />
            </div>
            <div className="relative mb-6">
              <h1 className="text-left text-2xl font-semibold tracking-tight text-gray-900">
                {"Continue with Bouncy"}
              </h1>
            </div>
            <form onSubmit={handleSubmitSignIn}>
              <div className="space-y-6">
                <TextField label="Email address" id="email" type="email" />
                <TextField
                  label="Password"
                  id="password"
                  show={show}
                  setShow={setShow}
                  type="password"
                />
                {errorResponse && (
                  <Error message="Invalid email or password. Please, try again." />
                )}
                <div className="flex w-full flex-row-reverse ">
                  <Button
                    variant="text"
                    href="#"
                    className="text-sm font-medium text-orange-600"
                  >
                    Forgot password?
                  </Button>
                </div>
              </div>
              <Button type="submit" color="orange" className="mt-8 w-full py-2">
                Sign in
              </Button>
            </form>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <button
                    onClick={() => {
                      router.push(getGoogleUrl(redirect_uri || null, game || null));
                    }}
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Continue with Google</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />{" "}
                    </svg>
                  </button>
                </div>

                <div>
                  <button
                    onClick={() => {}}
                    className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Continue with GitHub</span>
                    <svg
                      className="h-5 w-5"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="inline-flex my-5 space-x-2 w-full">
                <p className="text-sm text-gray-500">Don’t have an account? </p>
                <Button
                  variant="text"
                  onClick={() => {
                    setRegistrationMode(true);
                  }}
                  className="text-orange-500"
                >
                  Sign up
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Auth;

export const getServerSideProps: GetServerSideProps<AuthProps> = async (
  context
) => {
  const redirect_uri = (context.query.redirect_uri ?? null) as string | null;
  const game = (context.query.game ?? null) as string | null;
  const jwtToken = (context.query.token ?? null) as string | null;
  return {
    props: { redirect_uri, game, jwtToken },
  };
};
