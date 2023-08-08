import {ConnectButton} from "@rainbow-me/rainbowkit";
import type {GetServerSideProps, NextPage} from "next";
import {getServerSession} from "next-auth";
import {getAuthOptions} from "./api/auth/[...nextauth]";
import {useSession} from "next-auth/react";
import {StartRecoveryButton} from "../components/StartRecoveryButton";
import { CompleteRecoveryButton } from "../components/CompleteRecoveryButton";
import Notice from "../components/Notice";

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
    return {
        props: {
            session: await getServerSession(req, res, getAuthOptions(req)),
        },
    };
};

const Home: NextPage = () => {
    const {status, data} = useSession();

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
            <h2>Openfort Recoverable Accounts</h2>

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
                    <div style={{display: "inline-flex"}}>
                        <p>{"Openfort account address:"}</p>
                        <a
                            style={{display: "flex", alignItems: "center", marginLeft: "4px"}}
                            target="_blank"
                            href={"https://testnet.snowtrace.io/address/" + data.OF_address}
                        >
                            {data.OF_address}
                        </a>
                    </div>
                    <p>
                        1. Press on <strong>Start recovery</strong> to initiate the recovery process with the default guardian.
                    </p>
                    <StartRecoveryButton />
                    <p>
                        2. Press on <strong>Complete recovery</strong> to complete a recovery process with the default guardian.
                    </p>
                    <CompleteRecoveryButton />
                </div>
            )}
        </div>
    );
};

export default Home;
