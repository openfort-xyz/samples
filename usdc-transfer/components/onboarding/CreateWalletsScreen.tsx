import { useCallback, useState } from "react";
import { Alert, Button, ScrollView, Text, View, StyleSheet } from "react-native";
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
      <Text>{wallet?.address ?? "Not created yet"}</Text>
      <View style={styles.buttonWrap}>
        <Button
          title={isCreating ? "Creating..." : wallet ? `${label} Created` : `Create ${label}`}
          disabled={disabled || !!wallet}
          onPress={onCreateWallet}
        />
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
          <Button
            title="Next: Get Faucet Funds"
            onPress={onNext}
          />
        </View>
      )}
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
  buttonWrap: {
    width: '100%',
    maxWidth: 480,
    marginTop: 8,
  },
});