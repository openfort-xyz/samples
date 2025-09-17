import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { CustomButton } from "../ui";

interface CreateWalletScreenProps {
  isCreating: boolean;
  onCreateWallet: () => void;
  onLogout: () => void;
}

export const CreateWalletScreen: React.FC<CreateWalletScreenProps> = ({
  isCreating,
  onCreateWallet,
  onLogout,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0F1419", "#1A1F2E", "#0F1419"]}
        style={styles.backgroundGradient}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Hyperliquid Trading</Text>
          <Text style={styles.subtitle}>Create a wallet to start trading</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet Management</Text>
          <View style={styles.card}>
            <CustomButton
              title={isCreating ? "Creating Wallet..." : "Create New Wallet"}
              disabled={isCreating}
              onPress={onCreateWallet}
              style={styles.createWalletButton}
            />
            {isCreating && (
              <View style={styles.loaderRow}>
                <ActivityIndicator color="#00D4AA" />
                <Text style={styles.loaderText}>Provisioning your embedded wallet…</Text>
              </View>
            )}
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
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#8B949E",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "rgba(26, 31, 46, 0.7)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    gap: 16,
  },
  loaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  loaderText: {
    color: "#8B949E",
    fontSize: 14,
  },
  createWalletButton: {
    backgroundColor: "#00D4AA",
  },
  logoutButton: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  logoutButtonText: {
    color: "#EF4444",
  },
});
