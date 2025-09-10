import { OpenfortProvider, RecoveryMethod, AccountTypeEnum } from "@openfort/react-native";
import Constants from "expo-constants";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <OpenfortProvider
      publishableKey={Constants.expoConfig?.extra?.openfortPublishableKey}
      
      walletConfig={{
        accountType: "Externally Owned Account" as any,
        recoveryMethod: RecoveryMethod.PASSWORD,
        debug: true,
        ethereumProviderPolicyId: Constants.expoConfig?.extra?.openfortEthereumProviderPolicyId, // replace with your gas sponsorship policy
        shieldPublishableKey: Constants.expoConfig?.extra?.openfortShieldPublishableKey,
        shieldEncryptionKey: Constants.expoConfig?.extra?.openfortShieldEncryptionKey,
        // createEncryptedSessionEndpoint: "https://your-api.com/create-encrypted-session",
      }}
      supportedChains={[
        {
          id: 421614,
          name: 'Arbitrum Sepolia',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: { default: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] } },
        },
      ]}
    >
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, contentStyle: { paddingTop: 40, backgroundColor: '#000000' } }} />
      </Stack>
    </OpenfortProvider>
  );
}