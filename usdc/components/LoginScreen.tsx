// components/LoginScreen.tsx
import React from "react";
import { useGuestAuth } from "@openfort/react-native";
import { Button, View, StyleSheet } from "react-native";

export default function LoginScreen() {
  const { signUpGuest } = useGuestAuth();

  return (
    <View style={styles.container}>
      <Button
        title="Login as Guest"
        onPress={() => signUpGuest()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 10,
  },
});
