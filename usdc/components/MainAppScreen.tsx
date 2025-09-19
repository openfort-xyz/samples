// components/MainAppScreen.tsx
import React, { useCallback, useState } from "react";
import { Alert, Button, ScrollView, Text, View, StyleSheet, TextInput } from "react-native";
import { WalletData } from "@/types/wallet";
import { formatUSDC } from "../utils/format";
import { UserWallet } from "@openfort/react-native";
import { transferUSDC } from "../utils/erc20";
import { CHAIN_IDS, CHAIN_IDS_HEX } from "../constants/network";

interface MainAppScreenProps {
  walletA: WalletData | null;
  walletB: WalletData | null;
  transferAmount: string;
  setTransferAmount: (amount: string) => void;
  isTransferring: boolean;
  setIsTransferring: (transferring: boolean) => void;
  isInitialLoad: boolean;
  updateBalances: () => Promise<void>;
  logout: () => void;
  ethBalances: {[key: string]: string};
  activeWallet: UserWallet | null;
  setActiveWallet: (options?: any) => Promise<any>;
}

export const MainAppScreen = ({
  walletA,
  walletB,
  transferAmount,
  setTransferAmount,
  isTransferring,
  setIsTransferring,
  isInitialLoad,
  updateBalances,
  logout,
  ethBalances,
  activeWallet,
  setActiveWallet,
}: MainAppScreenProps) => {
  const [isSwitching, setIsSwitching] = useState(false);
  const onTransfer = useCallback(
    async (fromWallet: WalletData, toAddress: string, amount: string) => {
      if (!fromWallet?.wallet) return;
      setIsTransferring(true);
      try {
        const txHash = await transferUSDC({
          fromWallet: { address: fromWallet.address, wallet: fromWallet.wallet },
          toAddress,
          amount,
          activeWallet: activeWallet || undefined,
          setActiveWallet,
          chainIdHex: CHAIN_IDS_HEX.ETHEREUM_SEPOLIA,
          waitForReceipt: true,
        });
        console.log(`Transfer Successful. Tx: ${txHash}`);
        setTransferAmount("");
        await updateBalances();
      } catch (error: any) {
        Alert.alert("Transfer Failed", error?.message || "Could not complete the transfer.");
      } finally {
        setIsTransferring(false);
      }
    },
    [activeWallet, setActiveWallet, setIsTransferring, setTransferAmount, updateBalances]
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>USDC Transfer</Text>

      <View style={[styles.section, styles.activeSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>Active Wallet</Text>
          <Text style={styles.badge}>ACTIVE</Text>
        </View>
        <Text style={[styles.address, styles.addressActive]}>
          {activeWallet?.address === walletA?.address ? walletA?.address : walletB?.address}
        </Text>
        <Text style={styles.balance}>
          {(() => {
            const val = activeWallet?.address === walletA?.address ? walletA?.balance : walletB?.balance;
            if (isInitialLoad && !val) return 'Loading...';
            return `USDC: ${formatUSDC(val || '0')} USDC`;
          })()}
        </Text>
        <Text style={styles.gasBalance}>
          ETH: {ethBalances[activeWallet?.address || ""] || "0"} (gas)
        </Text>
      </View>

      <View style={[styles.section, styles.otherSection]}>
        <Text style={styles.label}>Other Wallet</Text>
        <Text style={styles.address}>
          {activeWallet?.address === walletA?.address ? walletB?.address : walletA?.address}
        </Text>
        <Text style={styles.balance}>
          {(() => {
            const val = activeWallet?.address === walletA?.address ? walletB?.balance : walletA?.balance;
            if (isInitialLoad && !val) return 'Loading...';
            return `USDC: ${formatUSDC(val || '0')} USDC`;
          })()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Amount (USDC)</Text>
        <TextInput
          style={styles.input}
          value={transferAmount}
          onChangeText={setTransferAmount}
          keyboardType="numeric"
          placeholder="Enter amount"
        />
      </View>

      <View style={styles.buttonRow}>
        <View style={styles.buttonFlex}>
          <Button
            title={isSwitching ? "Switching..." : `Switch Active Wallet`}
            disabled={isSwitching}
            onPress={async () => {
              const target = activeWallet?.address === walletA?.address ? walletB : walletA;
              if (!target) return;
              try {
                setIsSwitching(true);
                await setActiveWallet({ address: target.address, chainId: CHAIN_IDS.ETHEREUM_SEPOLIA });
              } catch (e: any) {
                Alert.alert("Switch Failed", e?.message || "Could not switch wallet");
              } finally {
                setIsSwitching(false);
              }
            }}
          />
        </View>
        <View style={styles.buttonFlex}>
          <Button
            title={isTransferring ? "Transferring..." : "Transfer USDC"}
            disabled={isTransferring || !walletA || !walletB || !transferAmount || !activeWallet}
            onPress={() => {
              const from = activeWallet?.address === walletA?.address ? walletA : walletB;
              const to = activeWallet?.address === walletA?.address ? walletB : walletA;
              if (from && to) onTransfer(from, to.address, transferAmount);
            }}
          />
        </View>
      </View>

      <View style={styles.buttonWrap}>
        <Button title="Refresh Balances" onPress={updateBalances} />
      </View>

      <View style={styles.buttonWrap}>
        <Button title="Logout" onPress={logout} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    width: '100%',
    maxWidth: 480,
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  address: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E8B57',
  },
  gasBalance: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginTop: 4,
  },
  buttonWrap: {
    width: '100%',
    maxWidth: 480,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badge: {
    backgroundColor: '#2E8B57',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '700',
  },
  activeSection: {
    backgroundColor: '#f0fff4',
    borderColor: '#2E8B57',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  otherSection: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
  },
  addressActive: {
    backgroundColor: '#e8f7ef',
    borderColor: '#2E8B57',
    borderWidth: 1,
  },
  buttonRow: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  buttonFlex: {
    flex: 1,
  },
});
