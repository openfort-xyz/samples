import { OAuthProvider, useOAuth, useOpenfort, UserWallet, useUser, useWallets } from "@openfort/react-native";
import React, { useCallback, useState, useEffect } from "react";
import { Button, ScrollView, Text, View, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { readContract } from "@wagmi/core";

import { useHypeUsdc, useHypeBalances } from '../services/HyperliquidClient';


const { width, height } = Dimensions.get('window');

export const UserScreen = () => {

  const { user } = useUser();
  const { isReady, error, logout: signOut } = useOpenfort();
  const { wallets, setActiveWallet, createWallet, activeWallet, isCreating } = useWallets();

  // Use the custom hook to continuously get @107 asset price
  const { price: hypeUsdcPrice, isLoading: hypeUsdcLoading, error: hypeUsdcError } = useHypeUsdc(1000);
  const { balances: hypeBalances, isLoading: hypeBalancesLoading, error: hypeBalancesError } = useHypeBalances(activeWallet?.address);

  // Hyperliquid state
  // const [hypePrice, setHypePrice] = useState<string>('0');
  // const [hypePosition, setHypePosition] = useState<HypePosition | null>(null);
  // const [userState, setUserState] = useState<UserState | null>(null);
  // const [userBalances, setUserBalances] = useState<UserBalances | null>(null);
  // const [portfolioSummary, setPortfolioSummary] = useState<any>(null);
  // const [isLoadingHypeData, setIsLoadingHypeData] = useState(false);
  // const [hyperliquidClient] = useState(() => new HyperliquidClient(false)); // mainnet


  // // Fetch HYPE price
  // const fetchHypePrice = useCallback(async () => {
  //   try {
  //     const price = await hyperliquidClient.getHypeUsdcPrice();
  //     setHypePrice(price);
  //   } catch (error) {
  //     console.error('Error fetching HYPE price:', error);
  //   }
  // }, [hyperliquidClient]);

  // // Fetch user HYPE data
  // const fetchUserHypeData = useCallback(async () => {
  //   if (!activeWallet?.address) return;

  //   setIsLoadingHypeData(true);
  //   try {
  //     const [
  //       { position, accountState },
  //       balances,
  //       portfolio
  //     ] = await Promise.all([
  //       hyperliquidClient.getUserHypeData(activeWallet.address),
  //       hyperliquidClient.getUserBalances(activeWallet.address),
  //       hyperliquidClient.getUserPortfolioSummary(activeWallet.address)
  //     ]);

  //     setHypePosition(position);
  //     setUserState(accountState);
  //     setUserBalances(balances);
  //     setPortfolioSummary(portfolio);
  //   } catch (error) {
  //     console.error('Error fetching user HYPE data:', error);
  //   } finally {
  //     setIsLoadingHypeData(false);
  //   }
  // }, [hyperliquidClient, activeWallet?.address]);

  // // Fetch HYPE price every 5 seconds
  // useEffect(() => {
  //   fetchHypePrice();
  //   const priceInterval = setInterval(fetchHypePrice, 5000);
  //   return () => clearInterval(priceInterval);
  // }, [fetchHypePrice]);

  // // Fetch user data when wallet changes or every 10 seconds
  // useEffect(() => {
  //   if (activeWallet?.address) {
  //     fetchUserHypeData();
  //     const dataInterval = setInterval(fetchUserHypeData, 10000);
  //     return () => clearInterval(dataInterval);
  //   }
  // }, [fetchUserHypeData, activeWallet?.address]);

  const CustomButton = ({ title, onPress, style, textStyle, disabled }: any) => (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, textStyle, disabled && styles.buttonTextDisabled]}>{title}</Text>
    </TouchableOpacity>
  );

  const GradientButton = ({ title, onPress, disabled }: any) => (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <LinearGradient
        colors={disabled ? ['#4A5568', '#2D3748'] : ['#00D4AA', '#00B894']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradientButton, disabled && styles.gradientButtonDisabled]}
      >
        <Text style={styles.gradientButtonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const handleBuy = () => {
  };

  const handleSell = () => {
    // }
  };

  if (!user) {
    return null;
  }

  // Show wallet connection UI if no active wallet
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
            <Text style={styles.subtitle}>Connect a wallet to start trading</Text>
          </View>

          {/* Wallet Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wallet Management</Text>
            <View style={styles.card}>

              <CustomButton
                title={isCreating ? "Creating Wallet..." : "Create New Wallet"}
                disabled={isCreating}
                onPress={() => createWallet({
                  recoveryPassword: "password",
                  onError: (error) => {
                    alert("Error creating wallet: " + error.message);
                  },
                  onSuccess: ({ wallet }) => {
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

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0F1419', '#1A1F2E', '#0F1419']}
        style={styles.backgroundGradient}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
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

            {/* {hypePosition && (
              <View style={styles.positionInfo}>
                <View style={styles.positionRow}>
                  <Text style={styles.positionLabel}>Position Size:</Text>
                  <Text style={[styles.positionValue, { color: parseFloat(hypePosition.size) > 0 ? '#00D4AA' : '#EF4444' }]}>
                    {parseFloat(hypePosition.size).toFixed(4)} HYPE
                  </Text>
                </View>
                <View style={styles.positionRow}>
                  <Text style={styles.positionLabel}>Unrealized PnL:</Text>
                  <Text style={[styles.positionValue, { color: parseFloat(hypePosition.unrealizedPnl) >= 0 ? '#00D4AA' : '#EF4444' }]}>
                    ${parseFloat(hypePosition.unrealizedPnl).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.positionRow}>
                  <Text style={styles.positionLabel}>Entry Price:</Text>
                  <Text style={styles.positionValue}>
                    ${hypePosition.entryPrice ? parseFloat(hypePosition.entryPrice).toFixed(4) : 'N/A'}
                  </Text>
                </View>
              </View>
            )} */}
          </View>
        </View>


        {/* {portfolioSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portfolio Summary</Text>
            <View style={styles.card}>
              <View style={styles.positionRow}>
                <Text style={styles.positionLabel}>Total Unrealized PnL:</Text>
                <Text style={[styles.positionValue, { color: parseFloat(portfolioSummary.totalUnrealizedPnl) >= 0 ? '#00D4AA' : '#EF4444' }]}>
                  ${parseFloat(portfolioSummary.totalUnrealizedPnl).toFixed(2)}
                </Text>
              </View>
              <View style={styles.positionRow}>
                <Text style={styles.positionLabel}>Active Positions:</Text>
                <Text style={styles.positionValue}>{portfolioSummary.totalPositions}</Text>
              </View>
              <View style={styles.positionRow}>
                <Text style={styles.positionLabel}>Margin Utilization:</Text>
                <Text style={[styles.positionValue, { color: parseFloat(portfolioSummary.marginUtilization) > 80 ? '#EF4444' : '#00D4AA' }]}>
                  {portfolioSummary.marginUtilization}%
                </Text>
              </View>
            </View>
          </View>
        )} */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trading Actions</Text>
          <View style={styles.tradingButtonsContainer}>
            <View style={styles.tradingButtonWrapper}>
              <GradientButton
                title="BUY"
                onPress={handleBuy}
                disabled={hypeUsdcLoading}
              />
            </View>
            <View style={styles.tradingButtonWrapper}>
              <CustomButton
                title="SELL"
                onPress={handleSell}
                style={styles.sellButton}
                textStyle={styles.sellButtonText}
                disabled={hypeUsdcLoading}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Balances</Text>
          <View style={styles.card}>
            {hypeBalances ? (
              <>
                <View style={styles.positionRow}>
                  <Text style={styles.positionLabel}>Hyperliquid Balance:</Text>
                  <Text style={styles.positionValue}>${parseFloat(hypeBalances).toFixed(2)}</Text>
                </View>
                <View style={styles.positionRow}>
                  <Text style={styles.positionLabel}>Position Balance:</Text>
                  <Text style={styles.positionValue}>${parseFloat(hypeBalances.totalPositionValue).toFixed(2)}</Text>
                </View>
                <View style={styles.positionRow}>
                  <Text style={styles.positionLabel}>Wallet Balance:</Text>
                  <Text style={styles.positionValue}>${}</Text>
                </View>
              </>
            ) : (
              <Text style={styles.positionLabel}>Loading balance data...</Text>
            )}
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
            {wallets.length > 1 && (
              <>
                <Text style={styles.subsectionTitle}>Switch Wallet</Text>
                <View style={styles.walletsList}>
                  {wallets.filter(w => w.address !== activeWallet.address).map((w, i) => (
                    <View key={w.address + i} style={styles.walletItem}>
                      <CustomButton
                        title={`${w.address.slice(0, 6)}...${w.address.slice(-4)}`}
                        onPress={() => setActiveWallet({
                          recoveryPassword: "password",
                          address: w.address,
                          onSuccess: () => {
                            alert("Active wallet set to: " + w.address);
                          },
                          onError: (error) => {
                            alert("Error setting active wallet: " + error.message);
                          }
                        })}
                        style={styles.walletButton}
                      />
                    </View>
                  ))}
                </View>
              </>
            )}
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
});

