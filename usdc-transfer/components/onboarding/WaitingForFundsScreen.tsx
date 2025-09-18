import React from "react";
import { ActivityIndicator, ScrollView, Text, View, StyleSheet, Pressable } from "react-native";
import * as Clipboard from "expo-clipboard";
import { WalletData } from "@/types/wallet";
import { formatUSDC } from "../../utils/format";
import { UserWallet } from "@openfort/react-native";
import { ERC20_BALANCE_TIMEOUT_MS } from "../../constants/erc20";
import { useUsdcBalance } from "../../utils/erc20";

interface Props {
  walletB: WalletData | null;
  onNext: () => void;
  onBack: () => void;
  onUpdateBalance: (balance: string) => void;
  activeWallet: UserWallet | null;
}

export const WaitingForFundsScreen = ({ walletB, onNext, onBack, onUpdateBalance, activeWallet }: Props) => {
  const { balance: currentBalance, hasBalance } = useUsdcBalance({
    activeWalletOrProvider: activeWallet,
    ownerAddress: walletB?.address,
    onBalanceUpdate: onUpdateBalance,
    options: { pollIntervalMs: 5000, stopWhenPositive: true, timeoutMs: ERC20_BALANCE_TIMEOUT_MS }
  });
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {
            hasBalance
              ? "Success!"
              : "Waiting for Funds"
          }
        </Text>
        <Text style={styles.subtitle}>
          {hasBalance 
            ? "Funds received successfully" 
            : "Please wait for USDC tokens to arrive"}
        </Text>
      </View>
      
      {/* Main Balance Display - Centerpiece */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          {/* Balance Amount */}
          <View style={styles.balanceDisplay}>
            <Text style={[
              styles.balanceAmount,
              hasBalance && styles.balanceAmountSuccess
            ]}>
              {formatUSDC(currentBalance)}
            </Text>
            <Text style={[
              styles.balanceCurrency,
              hasBalance && styles.balanceCurrencySuccess
            ]}>
              USDC
            </Text>
          </View>
          
          {/* Status Indicator */}
          <View style={styles.statusIndicator}>
            {!hasBalance ? (
              <View style={styles.loadingIndicator}>
                <ActivityIndicator size="small" color="#0066CC" />
                <Text style={styles.loadingText}>Checking balance...</Text>
              </View>
            ) : (
              <View style={styles.successIndicator}>
                <View style={styles.successBadge}>
                  <Text style={styles.successIcon}>✓</Text>
                </View>
                <Text style={styles.successText}>Funds received!</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Wallet Address */}
        <View style={styles.walletInfo}>
          <Text style={styles.walletLabel}>Wallet Address</Text>
          <Pressable
            style={styles.addressContainer}
            onPress={() => {
              const address = walletB?.address || '';
              Clipboard.setStringAsync(address);
            }}
          >
            <Text style={styles.addressText}>
              {truncateAddress(walletB?.address || '')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {hasBalance ? (
          <Pressable 
            style={styles.primaryButton}
            onPress={onNext}
          >
            <Text style={styles.primaryButtonText}>Continue to App</Text>
          </Pressable>
        ) : (
          <View style={styles.waitingInfo}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                The Circle faucet usually delivers funds within 30-60 seconds
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.secondaryActions}>
          <Text style={styles.troubleText}>Having trouble?</Text>
          <Pressable 
            style={styles.secondaryButton}
            onPress={onBack}
          >
            <Text style={styles.secondaryButtonText}>Go Back to Faucet</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  // Balance Container - The Centerpiece
  balanceContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  balanceDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceAmount: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#999',
  },
  balanceAmountSuccess: {
    color: '#22c55e',
  },
  balanceCurrency: {
    fontSize: 22,
    fontWeight: '600',
    color: '#999',
    marginTop: 4,
  },
  balanceCurrencySuccess: {
    color: '#22c55e',
  },
  
  // Status Indicators
  statusIndicator: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  successIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  successBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successText: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
  },
  
  // Wallet Info
  walletInfo: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  walletLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  addressContainer: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addressText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#555',
  },
  
  // Actions Container
  actionsContainer: {
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  primaryButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Waiting Info
  waitingInfo: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoText: {
    fontSize: 14,
    color: '#0066CC',
    lineHeight: 20,
    flex: 1,
  },
  
  // Secondary Actions
  secondaryActions: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  troubleText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
