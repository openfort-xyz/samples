import React from "react";
import {
  OpenfortProvider,
  getDefaultConfig,
  RecoveryMethod,
} from "@openfort/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "wagmi";
import { base } from "viem/chains";
import { AaveProvider } from "@aave/react";
import { aaveClient } from "./lib/aave";

const config = createConfig(
  getDefaultConfig({
    appName: "Openfort Wallet App",
    walletConnectProjectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || "demo",
    chains: [base],
    ssr: false,
  })
);

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AaveProvider client={aaveClient}>
          <OpenfortProvider
            // Set the publishable key of your Openfort account. This field is required.
            publishableKey={import.meta.env.VITE_OPENFORT_PUBLISHABLE_KEY}
            // Set the wallet configuration. In this example, we will be using the embedded wallet.
            walletConfig={{
              shieldPublishableKey: import.meta.env.VITE_OPENFORT_SHIELD_PUBLIC_KEY,
              createEncryptedSessionEndpoint: `${import.meta.env.VITE_BACKEND_URL}/api/create-encryption-session`,
              recoveryMethod: RecoveryMethod.PASSWORD,
              ethereumProviderPolicyId: import.meta.env.VITE_OPENFORT_POLICY_ID || undefined,
            }}
          >
            {children}
          </OpenfortProvider>
        </AaveProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 