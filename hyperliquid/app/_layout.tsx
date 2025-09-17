import { OpenfortProvider } from "@openfort/react-native";
import { Stack } from "expo-router";

import { EnvValidationWrapper } from "../components/envValidation/EnvValidationWrapper";
import { SUPPORTED_CHAINS } from "../constants/network";
import {
  getEthereumProviderPolicyId,
  getPublishableKey,
  getShieldEncryptionKey,
  getShieldPublishableKey,
} from "../utils/config";
import { getEncryptionSessionFromEndpoint } from "../services/walletRecovery";

function Providers() {
  const publishableKey = getPublishableKey();
  const shieldPublishableKey = getShieldPublishableKey();
  const shieldEncryptionKey = getShieldEncryptionKey();
  const ethereumProviderPolicyId = getEthereumProviderPolicyId();

  return (
    <OpenfortProvider
      publishableKey={publishableKey}
      walletConfig={{
        shieldPublishableKey,
        shieldEncryptionKey,
        ethereumProviderPolicyId,
        getEncryptionSession: getEncryptionSessionFromEndpoint,
        debug: false,
      }}
      supportedChains={SUPPORTED_CHAINS}
      verbose={true}
    >
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </OpenfortProvider>
  );
}

export default function RootLayout() {
  return (
    <EnvValidationWrapper>
      <Providers />
    </EnvValidationWrapper>
  );
}
