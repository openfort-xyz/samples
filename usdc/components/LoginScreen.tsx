// components/LoginScreen.tsx
import React from "react";
import { useGuestAuth } from "@openfort/react-native";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { signUpGuest } = useGuestAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable style={[styles.customButton, styles.primaryButton]} onPress={() => signUpGuest()}>
          <Text style={[styles.buttonText, styles.primaryButtonText]}>Login as Guest</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 24,
    paddingHorizontal: 24,
  },
  customButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minWidth: 200,
  },
  primaryButton: {
    backgroundColor: '#6772e5',
    borderColor: '#6772e5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButtonText: {
    color: '#fff',
  },
});
