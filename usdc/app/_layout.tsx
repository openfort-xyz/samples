// app/_layout.tsx
import { OpenfortProvider } from "@openfort/react-native";
import { getEncryptionSessionFromEndpoint } from "../services/walletRecovery";

import Constants from "expo-constants";
import { getPublishableKey, getShieldPublishableKey, getEthereumProviderPolicyId } from "../utils/config";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
 
export default function RootLayout() {
  const publishableKey = getPublishableKey();
  const shieldPublishableKey = getShieldPublishableKey();
  const ethereumProviderPolicyId = getEthereumProviderPolicyId();
  return (
    <SafeAreaProvider>
      <OpenfortProvider
        publishableKey={publishableKey}
        walletConfig={{
          debug: false,
          ethereumProviderPolicyId,
          shieldPublishableKey,
          getEncryptionSession: getEncryptionSessionFromEndpoint,
        }}
        verbose={true}
        supportedChains={[
          {
            id: 84532,
            name: 'Base Sepolia',
            nativeCurrency: {
              name: 'Base Sepolia Ether',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: {
              default: {
                http: [
                  'https://sepolia.base.org',
                  'https://base-sepolia-rpc.publicnode.com',
                  'https://base-sepolia.blockpi.network/v1/rpc/public',
                  'https://public.stackup.sh/api/v1/node/base-sepolia'
                ]
              }
            },
          },
          {
            id: 11155111,
            name: 'Sepolia',
            nativeCurrency: {
              name: 'Sepolia Ether',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: {
              default: {
                http: [
                  'https://ethereum-sepolia-rpc.publicnode.com',
                  'https://rpc.sepolia.org',
                  'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
                  'https://sepolia.drpc.org',
                  'https://rpc2.sepolia.org',
                  'https://sepolia.gateway.tenderly.co',
                  'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
                  'https://sepolia.alchemy.com/v2/demo',
                  'https://eth-sepolia.g.alchemy.com/v2/demo',
                  'https://sepolia.public.blastapi.io'
                ]
              }
            },
          },
        ]}
      >
        <Stack>
          <Stack.Screen
            name="index"
            options={{ headerShown: false }}
          />
        </Stack>
      </OpenfortProvider>
    </SafeAreaProvider>
  );
}
