import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useOpenfort, useOpenfortClient, useUser, useWallets } from "@openfort/react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";

import { CreateWalletScreen } from "./onboarding/CreateWalletScreen";
import { FundHyperliquidScreen } from "./onboarding/FundHyperliquidScreen";
import { MainAppScreen } from "./MainAppScreen";
import { useWalletBalance } from "../hooks/useUserBalances";
import { useHypeBalances, useHypeUsdc } from "../services/HyperliquidClient";

const ONBOARDING_SCREENS = ["create-wallet", "fund-exchange"] as const;
type OnboardingScreen = (typeof ONBOARDING_SCREENS)[number];
type Screen = OnboardingScreen | "trading";

const TOTAL_STEP_COUNT = ONBOARDING_SCREENS.length;

export const UserScreen: React.FC = () => {
  const { user } = useUser();
  const { logout } = useOpenfort();
  const openfortClient = useOpenfortClient();
  const wallets = useWallets({ throwOnError: true });
  const { activeWallet, isCreating } = wallets;
  const insets = useSafeAreaInsets();

  const [currentScreen, setCurrentScreen] = useState<Screen>("create-wallet");

  const hyperliquidAccountAddress = useMemo(() => {
    const address = Constants.expoConfig?.extra?.hyperliquidWalletAddress as `0x${string}`;
    console.log('Hyperliquid wallet address from env:', address);
    return address;
  }, []);

  const { price: hypeUsdcPrice, isLoading: hypeUsdcLoading } = useHypeUsdc();
  const {
    balances: hypeBalances,
    isLoading: hypeBalancesLoading,
    refetch: refetchHypeBalances,
  } = useHypeBalances(hyperliquidAccountAddress);
  const {
    balance: walletBalance,
    loading: walletBalanceLoading,
    refetch: refetchWalletBalance,
  } = useWalletBalance(activeWallet?.address);

  const onboardingStep = useMemo(() => {
    if (currentScreen === "trading") return TOTAL_STEP_COUNT;
    const index = ONBOARDING_SCREENS.indexOf(currentScreen as OnboardingScreen);
    return index >= 0 ? index + 1 : TOTAL_STEP_COUNT;
  }, [currentScreen]);

  useEffect(() => {
    if (activeWallet && currentScreen === "create-wallet") {
      setCurrentScreen("fund-exchange");
    }
  }, [activeWallet, currentScreen]);

  useEffect(() => {
    if (currentScreen === "fund-exchange") {
      refetchWalletBalance();
      refetchHypeBalances();
      const interval = setInterval(() => {
        refetchWalletBalance();
        refetchHypeBalances();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentScreen, refetchWalletBalance, refetchHypeBalances]);

  const handleCreateWallet = useCallback(() => {
    wallets.createWallet({
      recoveryPassword: "password",
      onError: (error: any) => {
        Alert.alert("Wallet Creation Failed", error?.message ?? "Please try again later.");
      },
      onSuccess: ({ wallet }: any) => {
        Alert.alert("Wallet Created", `Address: ${wallet?.address}`);
      },
    });
  }, [wallets]);

  const handleContinueToTrading = useCallback(() => {
    setCurrentScreen("trading");
  }, []);

  const logoutButton = (
    <TouchableOpacity onPress={logout} style={[styles.logoutButton, { top: insets.top + 10 }]}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );

  if (!user) {
    return null;
  }

  switch (currentScreen) {
    case "create-wallet":
      return (
        <View style={styles.screenWrapper}>
          {logoutButton}
          <CreateWalletScreen
            isCreating={isCreating}
            onCreateWallet={handleCreateWallet}
            step={onboardingStep}
            totalSteps={TOTAL_STEP_COUNT}
          />
        </View>
      );
    case "fund-exchange":
      return (
        <View style={styles.screenWrapper}>
          {logoutButton}
          <FundHyperliquidScreen
            walletAddress={activeWallet?.address}
            hyperliquidAddress={hyperliquidAccountAddress}
            walletBalance={walletBalance}
            hyperliquidBalance={Number(hypeBalances?.account?.usdcBalance ?? 0)}
            isLoading={walletBalanceLoading || hypeBalancesLoading}
            onContinue={handleContinueToTrading}
            step={onboardingStep}
            totalSteps={TOTAL_STEP_COUNT}
          />
        </View>
      );
    case "trading":
    default:
      return (
        <View style={styles.screenWrapper}>
          {logoutButton}
          <MainAppScreen
            activeWallet={activeWallet}
            openfortClient={openfortClient}
            walletBalance={walletBalance}
            walletBalanceLoading={walletBalanceLoading}
            hypeBalances={hypeBalances}
            hypeBalancesLoading={hypeBalancesLoading}
            refetchWalletBalance={refetchWalletBalance}
            refetchHypeBalances={refetchHypeBalances}
            hypeUsdcPrice={hypeUsdcPrice}
            hypeUsdcLoading={hypeUsdcLoading}
            hyperliquidAccountAddress={hyperliquidAccountAddress}
          />
        </View>
      );
  }
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    position: "relative",
  },
  logoutButton: {
    position: "absolute",
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(15, 20, 25, 0.6)",
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
