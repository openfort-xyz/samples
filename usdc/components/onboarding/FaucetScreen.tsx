import { useCallback, useState } from "react";
import { Button, ScrollView, Text, View, StyleSheet, Linking } from "react-native";
import * as Clipboard from "expo-clipboard";
import { WalletData } from "@/types/wallet";

interface Props {
  walletB: WalletData | null;
  onNext: () => void;
}

export const FaucetScreen = ({ walletB, onNext }: Props) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback((address: string) => {
    Clipboard.setStringAsync(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }, []);

  const openFaucet = useCallback(() => {
    Linking.openURL("https://faucet.circle.com/");
    // After opening the faucet, transition to waiting screen
    setTimeout(() => {
      onNext();
    }, 2000); // Give user 2 seconds to see the browser open
  }, [onNext]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Get Test USDC</Text>
      <Text style={styles.subtitle}>Step 2: Get faucet funds for Wallet B on Ethereum Sepolia</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Wallet B Address</Text>
        <Text style={styles.address}>{walletB?.address}</Text>
        <View style={styles.buttonWrap}>
          <Button
            title={copied ? "Copied!" : "Copy Address"}
            onPress={() => walletB && copyToClipboard(walletB.address)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.instructions}>
          1. Copy the wallet address above{"\n"}
          2. Open the Circle faucet{"\n"}
          3. Select "Ethereum Sepolia" network{"\n"}
          4. Paste the address and request $10 USDC
        </Text>
        <View style={styles.buttonWrap}>
          <Button
            title="Open Circle Faucet"
            onPress={openFaucet}
          />
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Note: After clicking "Open Circle Faucet", you'll be taken to a waiting screen that will automatically detect when funds arrive.
        </Text>
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
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  address: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonWrap: {
    width: '100%',
    maxWidth: 480,
    marginTop: 8,
  },
  disclaimer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0066cc33',
    width: '100%',
    maxWidth: 480,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#0066cc',
    lineHeight: 18,
  },
});
