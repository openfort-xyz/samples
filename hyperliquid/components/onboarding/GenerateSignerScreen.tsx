import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { GradientButton } from "../ui";

interface GenerateSignerScreenProps {
  isGenerating: boolean;
  onGenerateSigner: () => void;
  walletAddress?: string;
  step: number;
  totalSteps: number;
}

export const GenerateSignerScreen: React.FC<GenerateSignerScreenProps> = ({
  isGenerating,
  onGenerateSigner,
  walletAddress,
  step,
  totalSteps,
}) => {
  const truncated = React.useMemo(() => {
    if (!walletAddress) return null;
    return `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0F1419", "#1A1F2E", "#0F1419"]}
        style={styles.backgroundGradient}
      />

      <View style={styles.content}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>Step {step} of {totalSteps}</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Generate your Hyperliquid signer</Text>
          <Text style={styles.subtitle}>
            Openfort will export a signer key for this wallet so Hyperliquid can authorise orders on your behalf.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Wallet address</Text>
          <Text style={styles.summaryValue}>{truncated ?? "—"}</Text>
        </View>

        <View style={styles.card}>
          <GradientButton
            title={isGenerating ? "Generating signer…" : "Generate Signer"}
            onPress={onGenerateSigner}
            disabled={isGenerating}
          />
          {isGenerating && (
            <View style={styles.progressRow}>
              <ActivityIndicator color="#00D4AA" />
              <Text style={styles.progressText}>Creating EIP-712 credentials…</Text>
            </View>
          )}
        </View>

        <Text style={styles.hint}>
          The signer never leaves the device. We use it only to submit Hyperliquid orders in the next step.
        </Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 96,
    gap: 32,
  },
  stepBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0, 212, 170, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(0, 212, 170, 0.35)",
  },
  stepText: {
    color: "#00D4AA",
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  header: {
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 16,
    color: "#8B949E",
    lineHeight: 24,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(26, 31, 46, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: 8,
  },
  summaryLabel: {
    color: "#8B949E",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  card: {
    backgroundColor: "rgba(26, 31, 46, 0.9)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: 16,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressText: {
    color: "#8B949E",
    fontSize: 14,
  },
  hint: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
});
