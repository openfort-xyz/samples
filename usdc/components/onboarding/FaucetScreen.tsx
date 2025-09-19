import { useCallback, useState } from "react";
import { ScrollView, Text, View, StyleSheet, Linking, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { WalletData } from "@/types/wallet";

const CopyIcon = ({ size = 16, color = "#6772e5" }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: size * 0.9, color, fontWeight: '400', lineHeight: size }}>⧉</Text>
  </View>
);

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Get Test USDC</Text>
      <Text style={styles.subtitle}>Step 2: Get faucet funds for Wallet B on Ethereum Sepolia</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Wallet B Address</Text>
        <View style={styles.addressContainer}>
          <Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">{walletB?.address}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.copyButton,
              pressed && styles.buttonPressed
            ]}
            onPress={() => walletB && copyToClipboard(walletB.address)}
          >
            <View style={styles.iconContainer}>
              {copied ? (
                <Text style={styles.copiedText}>✓</Text>
              ) : (
                <CopyIcon size={16} />
              )}
            </View>
          </Pressable>
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
          <Pressable
            style={({ pressed }) => [
              styles.customButton,
              styles.primaryButton,
              pressed && styles.buttonPressed
            ]}
            onPress={openFaucet}>
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Open Circle Faucet</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Note: After clicking "Open Circle Faucet", you'll be taken to a waiting screen that will automatically detect when funds arrive.
        </Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  container: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6ebf1',
    borderRadius: 8,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424770',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1a1f36',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    color: '#8898aa',
    fontWeight: '400',
  },
  address: {
    fontFamily: 'monospace',
    fontSize: 13,
    backgroundColor: '#f6f9fc',
    color: '#6772e5',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e6ebf1',
    flex: 1,
    marginRight: 8,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
    color: '#525f7f',
  },
  buttonWrap: {
    width: '100%',
    maxWidth: 400,
    marginTop: 12,
  },
  disclaimer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6ebf1',
    width: '100%',
    maxWidth: 400,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#8898aa',
    lineHeight: 20,
  },
  customButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: '#6772e5',
    borderColor: '#6772e5',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderColor: '#e6ebf1',
  },
  successButton: {
    backgroundColor: '#00d924',
    borderColor: '#00d924',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#424770',
  },
  successButtonText: {
    color: '#fff',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  copyButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f6f9fc',
    borderWidth: 1,
    borderColor: '#e6ebf1',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    minHeight: 32,
  },
  copiedText: {
    color: '#00d924',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
  },
  iconContainer: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
