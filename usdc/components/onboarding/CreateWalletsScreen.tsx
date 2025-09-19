import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, View, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WalletData } from "@/types/wallet";

interface Props {
  walletA: WalletData | null;
  walletB: WalletData | null;
  onWalletACreated: (wallet: WalletData) => void;
  onWalletBCreated: (wallet: WalletData) => void;
  onNext: () => void;
  createWallet: (args: { chainId: number; onError: (e: any) => void; onSuccess: (res: any) => void }) => Promise<any> | void;
  isCreating: boolean;
}

interface WalletCreationItemProps {
  label: string;
  wallet: WalletData | null;
  isCreating: boolean;
  disabled: boolean;
  onCreateWallet: () => void;
}

const WalletCreationItem = ({ 
  label, 
  wallet, 
  isCreating, 
  disabled, 
  onCreateWallet 
}: WalletCreationItemProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
        {wallet?.address ?? "Not created yet"}
      </Text>
      <View style={styles.buttonWrap}>
        <Pressable
          style={[
            styles.customButton,
            wallet ? styles.successButton : styles.primaryButton,
            (disabled || !!wallet) && styles.buttonDisabled
          ]}
          disabled={disabled || !!wallet}
          onPress={onCreateWallet}
        >
          <Text style={[
            styles.buttonText,
            wallet ? styles.successButtonText : styles.primaryButtonText
          ]}>
            {isCreating ? "Creating..." : wallet ? `${label} Created` : `Create ${label}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export const CreateWalletsScreen = ({ 
  walletA, 
  walletB, 
  onWalletACreated, 
  onWalletBCreated, 
  onNext,
  createWallet,
  isCreating,
}: Props) => {
  const [isCreatingWalletA, setIsCreatingWalletA] = useState(false);
  const [isCreatingWalletB, setIsCreatingWalletB] = useState(false);

  const handleCreateWallet = useCallback((isFirstWallet: boolean) => {
    // Set the appropriate loading state
    if (isFirstWallet) {
      setIsCreatingWalletA(true);
    } else {
      setIsCreatingWalletB(true);
    }

    createWallet({
      chainId: 11155111, // Ethereum Sepolia (Circle faucet uses this chain)
      onError: (error) => {
        console.error("Error creating wallet", error);
        Alert.alert("Error", "Failed to create wallet");
        // Reset loading state on error
        if (isFirstWallet) {
          setIsCreatingWalletA(false);
        } else {
          setIsCreatingWalletB(false);
        }
      },
      onSuccess: ({ wallet }) => {
        if (!wallet?.address) return;
        
        const walletData: WalletData = {
          address: wallet.address,
          balance: "0",
          wallet: wallet
        };
        
        if (isFirstWallet) {
          onWalletACreated(walletData);
          setIsCreatingWalletA(false);
        } else {
          onWalletBCreated(walletData);
          setIsCreatingWalletB(false);
        }
      },
    });
  }, [createWallet, onWalletACreated, onWalletBCreated]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Your Wallets</Text>
      <Text style={styles.subtitle}>Step 1: Create two wallets</Text>
      
      <WalletCreationItem
        label="Wallet A"
        wallet={walletA}
        isCreating={isCreatingWalletA}
        disabled={isCreating}
        onCreateWallet={() => handleCreateWallet(true)}
      />

      <WalletCreationItem
        label="Wallet B"
        wallet={walletB}
        isCreating={isCreatingWalletB}
        disabled={isCreating || !walletA}
        onCreateWallet={() => handleCreateWallet(false)}
      />

      {walletA && walletB && (
        <View style={styles.buttonWrap}>
          <Pressable style={[styles.customButton, styles.primaryButton]} onPress={onNext}>
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Next: Get Faucet Funds</Text>
          </Pressable>
        </View>
      )}
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
  buttonWrap: {
    width: '100%',
    maxWidth: 400,
    marginTop: 12,
  },
  addressText: {
    fontFamily: 'monospace',
    fontSize: 13,
    backgroundColor: '#f6f9fc',
    color: '#6772e5',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e6ebf1',
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
  successButton: {
    backgroundColor: '#00d924',
    borderColor: '#00d924',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  primaryButtonText: {
    color: '#fff',
  },
  successButtonText: {
    color: '#fff',
  },
});