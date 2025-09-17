import React from "react";
import {
  Alert,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-chart-kit";
import { UserWallet } from "@openfort/react-native";

import { GradientButton } from "./ui";
import { usePriceChart } from "../hooks/usePriceChart";
import { transactionHandlers } from "../utils/transactions";
import { HYPE_SYMBOL } from "../constants/hyperliquid";

const { width } = Dimensions.get("window");

type FlowStep = "overview" | "direction" | "amount" | "confirm" | "result";
type SwapDirection = "buy" | "sell";

type SwapResult = {
  direction: SwapDirection;
  inputAmount: string;
  outputAmount: string | null;
  priceAtExecution: number | null;
  timestamp: number;
};

interface MainAppScreenProps {
  activeWallet: UserWallet | null;
  walletBalance: number | null;
  walletBalanceLoading: boolean;
  hypeBalances: { account: any; positions: any } | null;
  hypeBalancesLoading: boolean;
  refetchWalletBalance: () => void;
  refetchHypeBalances: () => void;
  hypeUsdcPrice: number | null;
  hypeUsdcLoading: boolean;
}

export const MainAppScreen: React.FC<MainAppScreenProps> = ({
  activeWallet,
  walletBalance,
  walletBalanceLoading,
  hypeBalances,
  hypeBalancesLoading,
  refetchWalletBalance,
  refetchHypeBalances,
  hypeUsdcPrice,
  hypeUsdcLoading,
}) => {
  const [flowStep, setFlowStep] = React.useState<FlowStep>("overview");
  const [swapDirection, setSwapDirection] = React.useState<SwapDirection | null>(null);
  const [swapAmount, setSwapAmount] = React.useState<string>("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [swapResult, setSwapResult] = React.useState<SwapResult | null>(null);

  const { priceHistory, timestamps } = usePriceChart(hypeUsdcPrice, hypeUsdcLoading);

  const hyperliquidUsdcBalance = React.useMemo(
    () => Number(hypeBalances?.account?.usdcBalance ?? 0),
    [hypeBalances]
  );

  const hypeTokenBalance = React.useMemo(() => {
    const position = hypeBalances?.account?.assetPositions?.find(
      (pos: any) => pos.coin === HYPE_SYMBOL
    );
    return parseFloat(position?.total || "0");
  }, [hypeBalances]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      refetchWalletBalance();
      refetchHypeBalances();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetchWalletBalance, refetchHypeBalances]);

  React.useEffect(() => {
    setSwapAmount("");
  }, [swapDirection]);

  const resetForNewSwap = React.useCallback(() => {
    setSwapDirection(null);
    setSwapAmount("");
    setSwapResult(null);
    setIsProcessing(false);
  }, []);

  const balanceCards = (
    <View style={styles.balanceRow}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Wallet USDC</Text>
        <Text style={styles.balanceValue}>
          {walletBalanceLoading ? "—" : `${(walletBalance ?? 0).toFixed(2)} USDC`}
        </Text>
      </View>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Hyperliquid USDC</Text>
        <Text style={styles.balanceValue}>
          {hypeBalancesLoading ? "—" : `${hyperliquidUsdcBalance.toFixed(2)} USDC`}
        </Text>
      </View>
    </View>
  );

  const renderOverview = () => (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Welcome to the Hyperliquid swapper</Text>
      <Text style={styles.sectionSubheading}>
        We’ll walk you through swapping USDC and {HYPE_SYMBOL} using your embedded wallet. Each screen
        highlights one action, so you always know what to do next.
      </Text>

      <View style={styles.chartCard}>
        {hypeUsdcLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#00D4AA" />
            <Text style={styles.loadingText}>Fetching live price…</Text>
          </View>
        ) : hypeUsdcPrice ? (
          <>
            <Text style={styles.priceValue}>${hypeUsdcPrice.toFixed(4)}</Text>
            <Text style={styles.priceLabel}>HYPE / USDC mid price</Text>
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
                width={width - 136}
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
              <Text style={styles.chartEmpty}>Collecting price data…</Text>
            )}
          </>
        ) : (
          <Text style={styles.errorText}>Unable to fetch price feed</Text>
        )}
      </View>

      {balanceCards}

      <GradientButton
        title="Start a swap"
        onPress={() => {
          resetForNewSwap();
          setFlowStep("direction");
        }}
      />
    </View>
  );

  const renderDirection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Choose your swap</Text>
      <Text style={styles.sectionSubheading}>
        Pick the direction you want to trade. You can always change it later.
      </Text>

      <View style={styles.directionRow}>
        <TouchableOpacity
          style={[styles.optionCard, swapDirection === "buy" && styles.optionCardSelected]}
          onPress={() => setSwapDirection("buy")}
        >
          <Text style={styles.optionTitle}>USDC → {HYPE_SYMBOL}</Text>
          <Text style={styles.optionSubtitle}>Spend USDC balance to buy {HYPE_SYMBOL}.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionCard, swapDirection === "sell" && styles.optionCardSelected]}
          onPress={() => setSwapDirection("sell")}
        >
          <Text style={styles.optionTitle}>{HYPE_SYMBOL} → USDC</Text>
          <Text style={styles.optionSubtitle}>Sell your {HYPE_SYMBOL} position back to USDC.</Text>
        </TouchableOpacity>
      </View>

      <GradientButton
        title="Continue"
        onPress={() => {
          if (!swapDirection) {
            Alert.alert("Select a swap", "Please choose a direction to continue.");
            return;
          }
          setFlowStep("amount");
        }}
      />
    </View>
  );

  const renderAmount = () => {
    const isBuy = swapDirection === "buy";
    const label = isBuy ? "Amount (USDC)" : `Amount (${HYPE_SYMBOL})`;
    const placeholder = isBuy ? "10.00" : "0.10";
    const availableBalance = isBuy
      ? `${hyperliquidUsdcBalance.toFixed(2)} USDC available on Hyperliquid`
      : `${hypeTokenBalance.toFixed(4)} ${HYPE_SYMBOL} ready to sell`;

    const parsed = parseFloat(swapAmount);
    const isValid = !Number.isNaN(parsed) && parsed > 0;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Enter an amount</Text>
        <Text style={styles.sectionSubheading}>
          This is the notional you’ll swap. We’ll confirm everything on the next screen.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>{label}</Text>
          <TextInput
            style={styles.input}
            value={swapAmount}
            onChangeText={setSwapAmount}
            placeholder={placeholder}
            placeholderTextColor="#8B949E"
            keyboardType="numeric"
          />
          <Text style={styles.formHint}>{availableBalance}</Text>
        </View>

        <GradientButton
          title="Review swap"
          onPress={() => {
            if (!isValid) {
              Alert.alert("Invalid amount", "Enter a positive amount before continuing.");
              return;
            }
            setFlowStep("confirm");
          }}
          disabled={!isValid}
        />
      </View>
    );
  };

  const renderConfirm = () => {
    const isBuy = swapDirection === "buy";
    const amountNumber = parseFloat(swapAmount) || 0;
    const estimatedOutput = (() => {
      if (!hypeUsdcPrice || amountNumber <= 0) return null;
      if (isBuy) {
        return (amountNumber / hypeUsdcPrice).toFixed(4);
      }
      return (amountNumber * hypeUsdcPrice).toFixed(2);
    })();

    const summaryLabel = isBuy
      ? `Spend ${swapAmount || "0"} USDC to receive ~${estimatedOutput ?? "—"} ${HYPE_SYMBOL}`
      : `Sell ${swapAmount || "0"} ${HYPE_SYMBOL} to receive ~${estimatedOutput ?? "—"} USDC`;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Confirm your swap</Text>
        <Text style={styles.sectionSubheading}>
          Double-check the details below. Price estimates use the latest Hyperliquid mid price.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Swap summary</Text>
          <Text style={styles.summaryValue}>{summaryLabel}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Current price</Text>
            <Text style={styles.summaryValueSmall}>
              {hypeUsdcPrice ? `$${hypeUsdcPrice.toFixed(4)} / ${HYPE_SYMBOL}` : "—"}
            </Text>
          </View>
        </View>

        <GradientButton
          title={isProcessing ? "Swapping…" : "Swap now"}
          onPress={async () => {
            if (!activeWallet) {
              Alert.alert("No wallet", "Reconnect your Openfort wallet before swapping.");
              return;
            }
            if (!swapDirection) {
              Alert.alert("No direction", "Pick a swap direction before continuing.");
              return;
            }

            const amountToSwap = swapAmount;
            const expectedOutput = estimatedOutput;

            if (swapDirection === "buy") {
              const success = await transactionHandlers.handleBuy(
                activeWallet,
                amountToSwap,
                hypeBalances,
                setIsProcessing,
                setSwapAmount
              );
              if (success) {
                await Promise.allSettled([refetchWalletBalance(), refetchHypeBalances()]);
                setSwapResult({
                  direction: "buy",
                  inputAmount: amountToSwap,
                  outputAmount: expectedOutput ?? null,
                  priceAtExecution: hypeUsdcPrice,
                  timestamp: Date.now(),
                });
                setFlowStep("result");
                return;
              }
            } else {
              const success = await transactionHandlers.handleSell(
                activeWallet,
                amountToSwap,
                hypeBalances,
                setIsProcessing,
                setSwapAmount
              );
              if (success) {
                await Promise.allSettled([refetchWalletBalance(), refetchHypeBalances()]);
                setSwapResult({
                  direction: "sell",
                  inputAmount: amountToSwap,
                  outputAmount: expectedOutput ?? null,
                  priceAtExecution: hypeUsdcPrice,
                  timestamp: Date.now(),
                });
                setFlowStep("result");
                return;
              }
            }
          }}
          disabled={isProcessing}
          variant={swapDirection === "sell" ? "danger" : "primary"}
        />
      </View>
    );
  };

  const renderResult = () => {
    const isBuy = swapResult?.direction === "buy";
    const headline = isBuy ? "Swap complete" : "Sell order complete";
    const summaryText = isBuy
      ? `Swapped ${swapResult?.inputAmount ?? "0"} USDC for about ${swapResult?.outputAmount ?? "—"} ${HYPE_SYMBOL}`
      : `Swapped ${swapResult?.inputAmount ?? "0"} ${HYPE_SYMBOL} for about ${swapResult?.outputAmount ?? "—"} USDC`;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>{headline}</Text>
        <Text style={styles.sectionSubheading}>{summaryText}</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Price used</Text>
          <Text style={styles.summaryValueSmall}>
            {swapResult?.priceAtExecution ? `$${swapResult.priceAtExecution.toFixed(4)} / ${HYPE_SYMBOL}` : "—"}
          </Text>
          <Text style={styles.summaryLabel}>Timestamp</Text>
          <Text style={styles.summaryValueSmall}>
            {swapResult?.timestamp ? new Date(swapResult.timestamp).toLocaleTimeString() : "—"}
          </Text>
        </View>

        <GradientButton
          title="Swap again"
          onPress={() => {
            resetForNewSwap();
            setFlowStep("direction");
          }}
        />
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (flowStep) {
      case "overview":
        return renderOverview();
      case "direction":
        return renderDirection();
      case "amount":
        return renderAmount();
      case "confirm":
        return renderConfirm();
      case "result":
        return renderResult();
      default:
        return renderOverview();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0F1419", "#1A1F2E", "#0F1419"]}
        style={styles.backgroundGradient}
      />
      <View style={styles.wrapper}>
        <Text style={styles.heading}>Hyperliquid guided swap</Text>
        {renderCurrentStep()}
      </View>
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
  wrapper: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    gap: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  section: {
    backgroundColor: "rgba(26, 31, 46, 0.86)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 170, 0.15)",
    padding: 24,
    gap: 24,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sectionSubheading: {
    fontSize: 15,
    color: "#8B949E",
    lineHeight: 22,
  },
  balanceRow: {
    flexDirection: "row",
    gap: 16,
  },
  balanceCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(15, 20, 25, 0.8)",
    gap: 8,
  },
  balanceLabel: {
    color: "#8B949E",
    fontSize: 13,
  },
  balanceValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  chartCard: {
    backgroundColor: "rgba(15, 20, 25, 0.7)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
    gap: 16,
  },
  chart: {
    borderRadius: 12,
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
  },
  chartEmpty: {
    fontSize: 13,
    textAlign: "center",
    color: "#8B949E",
  },
  loadingRow: {
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
  directionRow: {
    flexDirection: "column",
    gap: 16,
  },
  optionCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(15, 20, 25, 0.75)",
    gap: 8,
  },
  optionCardSelected: {
    borderColor: "rgba(0, 212, 170, 0.6)",
    backgroundColor: "rgba(0, 212, 170, 0.12)",
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#8B949E",
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(15, 20, 25, 0.7)",
    padding: 20,
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 16,
    backgroundColor: "rgba(15, 20, 25, 0.6)",
  },
  formHint: {
    fontSize: 13,
    color: "#8B949E",
  },
  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(15, 20, 25, 0.7)",
    padding: 20,
    gap: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#8B949E",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  summaryValue: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    lineHeight: 22,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryKey: {
    fontSize: 14,
    color: "#8B949E",
  },
  summaryValueSmall: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
