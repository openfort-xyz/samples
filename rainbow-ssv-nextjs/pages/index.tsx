import {ConnectButton} from "@rainbow-me/rainbowkit";
import type {GetServerSideProps, NextPage} from "next";
import {getServerSession} from "next-auth";
import {getAuthOptions} from "./api/auth/[...nextauth]";
import {useSession} from "next-auth/react";
import {RegisterButton} from "../components/RegisterSessionButton";
import {RevokeButton} from "../components/RevokeSessionButton";
import {CollectButton} from "../components/CollectButton";
import Notice from "../components/Notice";

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
    return {
        props: {
            session: await getServerSession(req, res, getAuthOptions(req)),
        },
    };
};

const Home: NextPage = () => {
    const {status} = useSession();

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                padding: 12,
            }}
        >
            <h2>Openfort + SIWE + Wagmi</h2>

            <ConnectButton showBalance={false} accountStatus={"avatar"} />
            <Notice />
            {status === "authenticated" && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginTop: "40px",
                        gap: "10px",
                    }}
                >
                    <p>
                        1. Press on <strong>Mint an NFT</strong> without a session key (MM pop-up will appear)
                    </p>
                    <CollectButton />
                    <p>
                        2. Press on <strong>Register session</strong> and on <strong>Mint an NFT</strong> again (no
                        pop-up this time).
                    </p>
                    <RegisterButton />
                    <p>
                        3. Press on <strong>Revoke session</strong> Revoke the session key
                    </p>
                    <RevokeButton />
                </div>
            )}
        </div>
    );
};

export default Home;
