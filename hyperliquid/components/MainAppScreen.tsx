import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import { UserWallet } from "@openfort/react-native";

import { CustomButton, GradientButton } from "./ui";
import { useWalletBalance } from "../hooks/useUserBalances";
import { useHypeBalances, useHypeUsdc } from "../services/HyperliquidClient";
import { useTradingState } from "../hooks/useTradingState";
import { usePriceChart } from "../hooks/usePriceChart";
import { getMaxAmount, transactionHandlers } from "../utils/transactions";
import { HYPE_SYMBOL } from "../constants/hyperliquid";

const { width } = Dimensions.get("window");

interface MainAppScreenProps {
  activeWallet: UserWallet;
  exportPrivateKey: () => Promise<string>;
  onLogout: () => void;
}

export const MainAppScreen: React.FC<MainAppScreenProps> = ({
  activeWallet,
  exportPrivateKey,
  onLogout,
}) => {
  const pairLabel = `${HYPE_SYMBOL}/USDC`;
  const { price: hypeUsdcPrice, isLoading: hypeUsdcLoading } = useHypeUsdc();
  const {
    balances: hypeBalances,
    isLoading: hypeBalancesLoading,
    error: hypeBalancesError,
    refetch: refetchHypeBalances,
  } = useHypeBalances(activeWallet?.address as `0x${string}` | undefined);
  const {
    balance: walletBalance,
    loading: walletBalanceLoading,
    refetch: refetchWalletBalance,
  } = useWalletBalance(activeWallet?.address);

  React.useEffect(() => {
    const interval = setInterval(() => {
      refetchWalletBalance();
      refetchHypeBalances();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetchWalletBalance, refetchHypeBalances]);

  const tradingState = useTradingState();
  const { priceHistory, timestamps } = usePriceChart(hypeUsdcPrice, hypeUsdcLoading);

  const handleBuy = () => {
    transactionHandlers.handleBuy(
      activeWallet,
      tradingState.buyAmount,
      hypeBalances,
      tradingState.setIsBuying,
      tradingState.setBuyAmount
    );
  };

  const handleSell = () => {
    transactionHandlers.handleSell(
      activeWallet,
      tradingState.sellAmount,
      hypeBalances,
      tradingState.setIsSelling,
      tradingState.setSellAmount
    );
  };

  const handleMaxBuy = () => {
    const maxAmount = getMaxAmount(hypeBalances?.account?.usdcBalance);
    tradingState.setBuyAmount(maxAmount);
  };

  const handleTransfer = () => {
    transactionHandlers.handleTransfer(
      tradingState.transferAmount,
      walletBalance,
      activeWallet,
      exportPrivateKey,
      tradingState.setIsTransferring,
      tradingState.setTransferAmount,
      () => {
        refetchWalletBalance();
        refetchHypeBalances();
      }
    );
  };

  const handleMaxTransfer = () => {
    const maxAmount = getMaxAmount(walletBalance);
    tradingState.setTransferAmount(maxAmount);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0F1419", "#1A1F2E", "#0F1419"]}
        style={styles.backgroundGradient}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Hyperliquid Trading</Text>
          <Text style={styles.subtitle}>Swap {pairLabel} with your embedded wallet</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Feed ({pairLabel})</Text>
          <View style={styles.card}>
            {hypeUsdcLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#00D4AA" />
                <Text style={styles.loadingText}>Fetching latest price…</Text>
              </View>
            ) : hypeUsdcPrice ? (
              <View>
                <Text style={styles.priceValue}>${hypeUsdcPrice.toFixed(4)}</Text>
                <Text style={styles.priceLabel}>Live mid price</Text>
                {priceHistory.length > 1 ? (
                  <LineChart
                    data={{
                      labels: timestamps,
                      datasets: [
                        {
                          data: priceHistory,
                        },
                      ],
                    }}
                    width={width - 64}
                    height={160}
                    chartConfig={{
                      backgroundColor: "transparent",
                      backgroundGradientFrom: "rgba(15, 20, 25, 0)",
                      backgroundGradientTo: "rgba(15, 20, 25, 0)",
                      decimalPlaces: 4,
                      color: (opacity = 1) => `rgba(0, 212, 170, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(139, 148, 158, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForDots: {
                        r: "3",
                        strokeWidth: "1",
                        stroke: "#00D4AA",
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: "5,5",
                        stroke: "rgba(139, 148, 158, 0.2)",
                        strokeWidth: 1,
                      },
                    }}
                    bezier
                    style={styles.chart}
                    withHorizontalLabels
                    withVerticalLabels
                    withDots
                    withShadow={false}
                    withInnerLines
                    withOuterLines={false}
                  />
                ) : (
                  <View style={styles.chartPlaceholderContainer}>
                    <Text style={styles.chartPlaceholderText}>Collecting price data…</Text>
                    <Text style={styles.chartPlaceholderSubtext}>
                      Chart appears after a few price updates
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.errorText}>Unable to fetch price feed</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trading Actions</Text>
          <View style={styles.card}>
            <View style={styles.transferContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount (USDC)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.transferInput}
                    value={tradingState.buyAmount}
                    onChangeText={tradingState.setBuyAmount}
                    placeholder="0.00"
                    placeholderTextColor="#8B949E"
                    keyboardType="numeric"
                    editable={!tradingState.isBuying}
                  />
                  <TouchableOpacity
                    style={styles.maxButton}
                    onPress={handleMaxBuy}
                    disabled={tradingState.isBuying}
                  >
                    <Text style={styles.maxButtonText}>MAX</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.transferButtonContainer}>
                <GradientButton
                  title={
                    tradingState.isBuying ? "Buying…" : `Buy ${HYPE_SYMBOL}`
                  }
                  onPress={handleBuy}
                  disabled={
                    tradingState.isBuying ||
                    !tradingState.buyAmount ||
                    parseFloat(tradingState.buyAmount) <= 0
                  }
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Position Balance</Text>
          <View style={styles.card}>
            {hypeBalancesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#00D4AA" />
                <Text style={styles.loadingText}>Fetching Hyperliquid balances…</Text>
              </View>
            ) : hypeBalances?.account && hypeUsdcPrice ? (
              (() => {
                const hypePosition = hypeBalances.account?.assetPositions?.find(
                  (pos: any) => pos.coin === HYPE_SYMBOL
                );
                if (!hypePosition) {
                  return (
                    <Text style={styles.positionLabel}>No {HYPE_SYMBOL} position found</Text>
                  );
                }

                const currentHypeAmount = parseFloat(hypePosition.total || "0");
                const entryValue = parseFloat(hypePosition.entryNtl || "0");
                const currentValue = currentHypeAmount * hypeUsdcPrice;
                const pnl = currentValue - entryValue;
                const pnlPercentage = entryValue > 0 ? (pnl / entryValue) * 100 : 0;

                return (
                  <>
                    <View style={styles.positionRow}>
                      <Text style={styles.positionLabel}>{HYPE_SYMBOL} Amount:</Text>
                    <Text style={styles.positionValue}>
                        {currentHypeAmount.toFixed(4)} {HYPE_SYMBOL}
                      </Text>
                    </View>
                    <View style={styles.positionRow}>
                      <Text style={styles.positionLabel}>Current Value:</Text>
                      <Text style={styles.positionValue}>
                        ${currentValue.toFixed(2)} USDC
                      </Text>
                    </View>
                    <View style={styles.positionRow}>
                      <Text style={styles.positionLabel}>Entry Value:</Text>
                      <Text style={styles.positionValue}>
                        ${entryValue.toFixed(2)} USDC
                      </Text>
                    </View>
                    <View style={styles.positionRow}>
                      <Text style={styles.positionLabel}>PNL:</Text>
                      <Text
                        style={[
                          styles.positionValue,
                          { color: pnl >= 0 ? "#00D4AA" : "#EF4444" },
                        ]}
                      >
                        ${pnl.toFixed(2)} ({pnlPercentage >= 0 ? "+" : ""}
                        {pnlPercentage.toFixed(2)}%)
                      </Text>
                    </View>

                    {currentHypeAmount > 0 && (
                      <View style={styles.sellSection}>
                        <View style={styles.inputContainer}>
                          <Text style={styles.inputLabel}>Sell Amount ({HYPE_SYMBOL})</Text>
                          <View style={styles.inputWrapper}>
                            <TextInput
                              style={styles.transferInput}
                              value={tradingState.sellAmount}
                              onChangeText={tradingState.setSellAmount}
                              placeholder="0.0000"
                              placeholderTextColor="#8B949E"
                              keyboardType="numeric"
                              editable={!tradingState.isSelling}
                            />
                            <TouchableOpacity
                              style={styles.maxButton}
                              onPress={() =>
                                tradingState.setSellAmount(currentHypeAmount.toString())
                              }
                              disabled={tradingState.isSelling}
                            >
                              <Text style={styles.maxButtonText}>MAX</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.transferButtonContainer}>
                            <GradientButton
                              title={
                                tradingState.isSelling ? "Selling…" : `Sell ${HYPE_SYMBOL}`
                              }
                              onPress={handleSell}
                              disabled={
                                tradingState.isSelling ||
                                !tradingState.sellAmount ||
                                parseFloat(tradingState.sellAmount) <= 0
                              }
                              variant="danger"
                            />
                          </View>
                        </View>
                      </View>
                    )}
                  </>
                );
              })()
            ) : (
              <Text style={styles.errorText}>
                {hypeBalancesError || "Unable to fetch balance data"}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Balances</Text>
          <View style={styles.card}>
            <View style={styles.positionRow}>
              <Text style={styles.positionLabel}>Hyperliquid Balance:</Text>
              <Text style={styles.positionValue}>
                {hypeBalances?.account?.usdcBalance ?? 0} USDC
              </Text>
            </View>
            <View style={styles.positionRow}>
              <Text style={styles.positionLabel}>Wallet Balance:</Text>
              <Text style={styles.positionValue}>
                {walletBalanceLoading ? "Loading…" : `${walletBalance ?? 0} USDC`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transfer to Hyperliquid</Text>
          <View style={styles.card}>
            <View style={styles.transferContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount (USDC)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.transferInput}
                    value={tradingState.transferAmount}
                    onChangeText={tradingState.setTransferAmount}
                    placeholder="0.00"
                    placeholderTextColor="#8B949E"
                    keyboardType="numeric"
                    editable={!tradingState.isTransferring}
                  />
                  <TouchableOpacity
                    style={styles.maxButton}
                    onPress={handleMaxTransfer}
                    disabled={tradingState.isTransferring}
                  >
                    <Text style={styles.maxButtonText}>MAX</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.transferButtonContainer}>
                <GradientButton
                  title={
                    tradingState.isTransferring ? "Transferring…" : "Transfer to Hyperliquid"
                  }
                  onPress={handleTransfer}
                  disabled={
                    tradingState.isTransferring ||
                    !tradingState.transferAmount ||
                    parseFloat(tradingState.transferAmount) <= 0
                  }
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Connected Wallet</Text>
              <Text style={styles.walletAddress}>
                {`${activeWallet.address.slice(0, 6)}...${activeWallet.address.slice(-4)}`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <CustomButton
            title="Logout"
            onPress={onLogout}
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1419",
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#8B949E",
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "rgba(26, 31, 46, 0.8)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 170, 0.1)",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#8B949E",
    fontSize: 14,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#00D4AA",
    textAlign: "center",
  },
  priceLabel: {
    fontSize: 14,
    color: "#8B949E",
    textAlign: "center",
    marginBottom: 16,
  },
  chart: {
    marginTop: 8,
    borderRadius: 10,
  },
  chartPlaceholderContainer: {
    marginTop: 20,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  chartPlaceholderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B949E",
    marginBottom: 4,
  },
  chartPlaceholderSubtext: {
    fontSize: 12,
    color: "#8B949E",
    textAlign: "center",
  },
  transferContainer: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  transferInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 16,
  },
  maxButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  maxButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#00D4AA",
  },
  transferButtonContainer: {
    marginTop: 4,
  },
  positionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  positionLabel: {
    fontSize: 14,
    color: "#8B949E",
  },
  positionValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sellSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  infoRow: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    color: "#8B949E",
  },
  walletAddress: {
    fontSize: 14,
    color: "#00D4AA",
    fontWeight: "500",
    fontFamily: "monospace",
  },
  logoutButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  logoutButtonText: {
    color: "#EF4444",
  },
});
