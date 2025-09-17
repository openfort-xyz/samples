import { useOpenfort, useUser, useWallets } from "@openfort/react-native";
import React from "react";
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, TextInput, Alert } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { useWalletBalance } from "../hooks/useUserBalances";
import { useHypeUsdc, useHypeBalances } from '../services/HyperliquidClient';
import { useTradingState } from '../hooks/useTradingState';
import { usePriceChart } from '../hooks/usePriceChart';
import { CustomButton, GradientButton } from './ui';
import { transactionHandlers, getMaxAmount } from '../utils/transactions';

const { width, height } = Dimensions.get('window');

export const UserScreen = () => {
  const { user } = useUser();
  const { isReady, error, logout: signOut } = useOpenfort();
  const { wallets, setActiveWallet, createWallet, activeWallet, isCreating, exportPrivateKey } = useWallets();

  // Asset price & balances
  const { price: hypeUsdcPrice, isLoading: hypeUsdcLoading, error: hypeUsdcError } = useHypeUsdc(1000);
  const { balances: hypeBalances, isLoading: hypeBalancesLoading, error: hypeBalancesError, refetch: refetchHypeBalances } = useHypeBalances(activeWallet?.address);
  const { balance: walletBalance, loading, refetch: refetchWalletBalance } = useWalletBalance(activeWallet?.address);

  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log("refetching wallet balance and hype balances");
      refetchWalletBalance();
      refetchHypeBalances();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetchWalletBalance, refetchHypeBalances]);

  // Custom hooks for state management
  const tradingState = useTradingState();
  const { priceHistory } = usePriceChart(hypeUsdcPrice, hypeUsdcLoading);

  // Transaction handlers 
  const handleBuy = () => transactionHandlers.handleBuy(
    activeWallet,
    tradingState.buyAmount,
    hypeBalances,
    tradingState.setIsBuying,
    tradingState.setBuyAmount
  );

  const handleSell = () => transactionHandlers.handleSell(
    activeWallet,
    tradingState.sellAmount,
    hypeBalances,
    tradingState.setIsSelling,
    tradingState.setSellAmount
  );

  const handleMaxBuy = () => {
    const maxAmount = getMaxAmount(hypeBalances?.account?.usdcBalance);
    tradingState.setBuyAmount(maxAmount);
  };

  const handleTransfer = () => transactionHandlers.handleTransfer(
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

  const handleMaxTransfer = () => {
    const maxAmount = getMaxAmount(walletBalance);
    tradingState.setTransferAmount(maxAmount);
  };

  if (!user) {
    return null;
  }

  // Wallet connection UI
  if (!activeWallet?.address) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0F1419', '#1A1F2E', '#0F1419']}
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
                onPress={() => createWallet({
                  recoveryPassword: "password",
                  onError: (error: any) => {
                    alert("Error creating wallet: " + error.message);
                  },
                  onSuccess: ({ wallet }: any) => {
                    alert("Wallet created successfully: " + wallet?.address);
                  },
                })}
                style={styles.createWalletButton}
              />
            </View>
          </View>

          <View style={styles.section}>
            <CustomButton
              title="Logout"
              onPress={signOut}
              style={styles.logoutButton}
              textStyle={styles.logoutButtonText}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  // Main UI
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F1419', '#1A1F2E', '#0F1419']}
        style={styles.backgroundGradient}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Hyperliquid Trading</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.priceContainer}>
            <View style={styles.priceHeader}>
              <Text style={styles.priceLabel}>HYPE/USDC</Text>
              {hypeUsdcLoading && <ActivityIndicator size="small" color="#00D4AA" />}
            </View>
            <Text style={styles.priceValue}>${hypeUsdcPrice?.toFixed(4) ?? 'N/A'}</Text>

            {/* Price Chart */}
            {priceHistory.length > 1 && (
              <View style={styles.chartSection}>
                <LineChart
                  data={{
                    labels: [],
                    datasets: [{
                      data: priceHistory,
                      strokeWidth: 2,
                    }]
                  }}
                  width={width - 88}
                  height={160}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'rgba(15, 20, 25, 0)',
                    backgroundGradientTo: 'rgba(15, 20, 25, 0)',
                    decimalPlaces: 4,
                    color: (opacity = 1) => `rgba(0, 212, 170, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(139, 148, 158, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: "3",
                      strokeWidth: "1",
                      stroke: "#00D4AA"
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: "5,5",
                      stroke: "rgba(139, 148, 158, 0.2)",
                      strokeWidth: 1
                    }
                  }}
                  bezier
                  style={styles.chart}
                  withHorizontalLabels={true}
                  withVerticalLabels={true}
                  withDots={true}
                  withShadow={false}
                  withInnerLines={true}
                  withOuterLines={false}
                />
              </View>
            )}
            {priceHistory.length <= 1 && (
              <View style={styles.chartPlaceholderContainer}>
                <Text style={styles.chartPlaceholderText}>Collecting price data...</Text>
                <Text style={styles.chartPlaceholderSubtext}>Chart will appear after a few price updates</Text>
              </View>
            )}
          </View>
        </View>

        {/* Trading Actions */}
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
                  title={tradingState.isBuying ? "Buying..." : "Buy HYPE"}
                  onPress={handleBuy}
                  disabled={tradingState.isBuying || !tradingState.buyAmount || parseFloat(tradingState.buyAmount) <= 0}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Position Balance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Position Balance</Text>
          <View style={styles.card}>
            {hypeBalances?.account && hypeUsdcPrice ? (() => {
              const hypePosition = hypeBalances.account?.assetPositions?.find((pos: any) => pos.coin === 'HYPE');
              if (hypePosition) {
                const currentHypeAmount = parseFloat(hypePosition.total || '0');
                const entryValue = parseFloat(hypePosition.entryNtl || '0');
                const currentValue = currentHypeAmount * hypeUsdcPrice;
                const pnl = currentValue - entryValue;
                const pnlPercentage = entryValue > 0 ? ((pnl / entryValue) * 100) : 0;
                return (
                  <>
                    <View style={styles.positionRow}>
                      <Text style={styles.positionLabel}>HYPE Amount:</Text>
                      <Text style={styles.positionValue}>{currentHypeAmount.toFixed(4)} HYPE</Text>
                    </View>
                    <View style={styles.positionRow}>
                      <Text style={styles.positionLabel}>Current Value:</Text>
                      <Text style={styles.positionValue}>${currentValue.toFixed(2)} USDC</Text>
                    </View>
                    <View style={styles.positionRow}>
                      <Text style={styles.positionLabel}>Entry Value:</Text>
                      <Text style={styles.positionValue}>${entryValue.toFixed(2)} USDC</Text>
                    </View>
                    <View style={styles.positionRow}>
                      <Text style={styles.positionLabel}>PNL:</Text>
                      <Text style={[
                        styles.positionValue,
                        { color: pnl >= 0 ? '#00D4AA' : '#EF4444' }
                      ]}>
                        ${pnl.toFixed(2)} ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                      </Text>
                    </View>

                    {/* Sell HYPE Section */}
                    {currentHypeAmount > 0 && (
                      <View style={styles.sellSection}>
                        <View style={styles.inputContainer}>
                          <Text style={styles.inputLabel}>Sell Amount (HYPE)</Text>
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
                              onPress={() => tradingState.setSellAmount(currentHypeAmount.toString())}
                              disabled={tradingState.isSelling}
                            >
                              <Text style={styles.maxButtonText}>MAX</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.transferButtonContainer}>
                            <GradientButton
                              title={tradingState.isSelling ? "Selling..." : "Sell HYPE"}
                              onPress={handleSell}
                              disabled={tradingState.isSelling || !tradingState.sellAmount || parseFloat(tradingState.sellAmount) <= 0}
                              variant="danger"
                            />
                          </View>
                        </View>
                      </View>
                    )}
                  </>
                );
              } else {
                return (
                  <View style={styles.positionRow}>
                    <Text style={styles.positionLabel}>No HYPE position found</Text>
                  </View>
                );
              }
            })() : (
              <Text style={styles.positionLabel}>Loading position data...</Text>
            )}
          </View>
        </View>

        {/* Account Balances */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Balances</Text>
          <View style={styles.card}>
            {hypeBalances ? (
              <>
                <View style={styles.positionRow}>
                  <Text style={styles.positionLabel}>Hyperliquid Balance:</Text>
                  <Text style={styles.positionValue}>{hypeBalances?.account?.usdcBalance ?? 0} USDC</Text>
                </View>
                <View style={styles.positionRow}>
                  <Text style={styles.positionLabel}>Wallet Balance:</Text>
                  <Text style={styles.positionValue}>{walletBalance ?? 0} USDC</Text>
                </View>
              </>
            ) : (
              <Text style={styles.positionLabel}>Loading balance data...</Text>
            )}
          </View>
        </View>

        {/* Transfer */}
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
                  title={tradingState.isTransferring ? "Transferring..." : "Transfer to Hyperliquid"}
                  onPress={handleTransfer}
                  disabled={tradingState.isTransferring || !tradingState.transferAmount || parseFloat(tradingState.transferAmount) <= 0}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Wallet Info */}
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

        {/* Logout */}
        <View style={styles.section}>
          <CustomButton
            title="Logout"
            onPress={signOut}
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          />
        </View>
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B949E',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(26, 31, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.1)',
  },
  tradingButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tradingButtonWrapper: {
    flex: 1,
  },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(139, 148, 158, 0.1)',
    borderColor: 'rgba(139, 148, 158, 0.2)',
  },
  buttonTextDisabled: {
    color: '#8B949E',
  },
  gradientButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradientButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sellButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  sellButtonText: {
    color: '#EF4444',
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#8B949E',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  walletAddress: {
    fontSize: 14,
    color: '#00D4AA',
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  walletsList: {
    gap: 8,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletButton: {
    flex: 1,
    height: 40,
  },
  connectingText: {
    color: '#8B949E',
    fontSize: 12,
    fontStyle: 'italic',
  },
  createWalletButton: {
    marginTop: 16,
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
    borderColor: 'rgba(0, 212, 170, 0.3)',
  },
  chainSwitchButton: {
    marginTop: 12,
  },
  signButton: {
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
    borderColor: 'rgba(0, 212, 170, 0.3)',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 40,
  },
  logoutButtonText: {
    color: '#EF4444',
  },
  chartContainer: {
    backgroundColor: 'rgba(26, 31, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.1)',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  chartPlaceholder: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#8B949E',
    textAlign: 'center',
  },
  priceContainer: {
    backgroundColor: 'rgba(26, 31, 46, 0.8)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.1)',
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B949E',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00D4AA',
    marginBottom: 20,
  },
  positionInfo: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 148, 158, 0.2)',
    paddingTop: 16,
    marginBottom: 16,
  },
  accountInfo: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 148, 158, 0.2)',
    paddingTop: 16,
  },
  positionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  positionLabel: {
    fontSize: 14,
    color: '#8B949E',
  },
  positionValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  transferContainer: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#8B949E',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transferInput: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  maxButton: {
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maxButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00D4AA',
  },
  transferButtonContainer: {
    marginTop: 4,
  },
  chartSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 10,
  },
  chartPlaceholderContainer: {
    marginTop: 20,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B949E',
    marginBottom: 4,
  },
  chartPlaceholderSubtext: {
    fontSize: 12,
    color: '#8B949E',
    textAlign: 'center',
  },
  vaultSelection: {
    marginBottom: 20,
  },
  vaultSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#8B949E',
    marginLeft: 8,
    fontSize: 14,
  },
  vaultScrollView: {
    paddingVertical: 4,
  },
  vaultOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    minWidth: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedVault: {
    backgroundColor: 'rgba(0, 245, 255, 0.2)',
    borderColor: '#00f5ff',
  },
  vaultName: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedVaultText: {
    color: '#00f5ff',
  },
  vaultAddress: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  vaultSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  createVaultButton: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  createVaultButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  createVaultForm: {
    backgroundColor: 'rgba(26, 31, 46, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.2)',
  },
  formRow: {
    marginBottom: 16,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sellSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
});

