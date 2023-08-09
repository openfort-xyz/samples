import "../styles/global.css";
import "@rainbow-me/rainbowkit/styles.css";
import type {AppProps} from "next/app";
import {RainbowKitProvider, getDefaultWallets, connectorsForWallets} from "@rainbow-me/rainbowkit";

import {configureChains, createConfig, WagmiConfig} from "wagmi";
import {mainnet, polygon, goerli, avalancheFuji} from "wagmi/chains";
import {publicProvider} from "wagmi/providers/public";
import {SessionProvider} from "next-auth/react";
import type {Session} from "next-auth";
import {RainbowKitSiweNextAuthProvider, GetSiweMessageOptions} from "@rainbow-me/rainbowkit-siwe-next-auth";

const {chains, publicClient, webSocketPublicClient} = configureChains(
    [mainnet, polygon, ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [avalancheFuji] : [])],
    [publicProvider()],
);

const projectId = "YOUR_PROJECT_ID";

const {wallets} = getDefaultWallets({
    appName: "Recoverable accounts demo",
    projectId,
    chains,
});

const demoAppInfo = {
    appName: "Recoverable accounts Demo",
};

const connectors = connectorsForWallets([...wallets]);

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
});

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
    statement: "Sign in to the Openfort recoverable accounts example app",
});

export default function App({
    Component,
    pageProps,
}: AppProps<{
    session: Session;
}>) {
    return (
        <SessionProvider refetchInterval={0} session={pageProps.session}>
            <WagmiConfig config={wagmiConfig}>
                <RainbowKitSiweNextAuthProvider getSiweMessageOptions={getSiweMessageOptions}>
                    <RainbowKitProvider appInfo={demoAppInfo} chains={chains}>
                        <Component {...pageProps} />
                    </RainbowKitProvider>
                </RainbowKitSiweNextAuthProvider>
            </WagmiConfig>
        </SessionProvider>
    );
}
