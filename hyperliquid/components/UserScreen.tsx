import React, { useCallback } from "react";
import { Alert } from "react-native";
import { useOpenfort, useUser, useWallets } from "@openfort/react-native";

import { CreateWalletScreen } from "./onboarding/CreateWalletScreen";
import { MainAppScreen } from "./MainAppScreen";

export const UserScreen: React.FC = () => {
  const { user } = useUser();
  const { logout } = useOpenfort();
  const { activeWallet, createWallet, isCreating, exportPrivateKey } = useWallets({ throwOnError: true });

  const handleCreateWallet = useCallback(() => {
    createWallet({
      recoveryPassword: "password",
      onError: (error: any) => {
        Alert.alert("Wallet Creation Failed", error?.message ?? "Please try again later.");
      },
      onSuccess: ({ wallet }: any) => {
        Alert.alert("Wallet Created", `Address: ${wallet?.address}`);
      },
    });
  }, [createWallet]);

  if (!user) {
    return null;
  }

  if (!activeWallet?.address) {
    return (
      <CreateWalletScreen
        isCreating={isCreating}
        onCreateWallet={handleCreateWallet}
        onLogout={logout}
      />
    );
  }

  return (
    <MainAppScreen
      activeWallet={activeWallet}
      exportPrivateKey={exportPrivateKey}
      onLogout={logout}
    />
  );
};
