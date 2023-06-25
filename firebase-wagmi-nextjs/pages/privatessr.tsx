import type { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { authServer } from "../lib/validate-session";
import type { TIdTokenResult } from "../lib/authContext";
import React, { ReactNode } from "react";
import { CollectButton } from "../components/CollectButton";
import { RegisterButton } from "../components/RegisterSessionButton";
import { RevokeButton } from "../components/RevokeSessionButton";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = await authServer(ctx);

  return { props: { user } };
};

const Home: NextPage = ({
  user,
}: {
  user?: TIdTokenResult;
  children?: ReactNode;
}) => {
  if (!user) return <h1>You need to login</h1>;

  return (
    <>
      <Head>
        <title>Private SSR</title>
      </Head>

      <main>
        <h1 className="uppercase font-bold">Private with SSR</h1>
        <p>Email : {user?.email ?? "Anonymous"}</p>
        <br />
        <div className="space-y-2">
          <p className="text-sm">Mint an NFT</p>
          <CollectButton />
          <p className="text-sm">
            Create a popup-less experience registering a session key
          </p>
          <RegisterButton />
          <p className="text-sm">Revoke previously created session key</p>
          <RevokeButton />
        </div>
      </main>
    </>
  );
};

export default Home;
