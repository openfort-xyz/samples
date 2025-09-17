import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ValidationError } from "../../utils/envValidation";

interface EnvValidationModalProps {
  visible: boolean;
  errors: ValidationError[];
  onClose?: () => void;
}

export function EnvValidationModal({
  visible,
  errors,
  onClose,
}: EnvValidationModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconWrapper}>
              <Text style={styles.iconText}>!</Text>
            </View>
            <View>
              <Text style={styles.title}>Configuration Error</Text>
              <Text style={styles.subtitle}>
                Environment variables are missing or invalid
              </Text>
            </View>
          </View>

          <ScrollView style={styles.errorList}>
            {errors.map((error) => (
              <View key={error.key} style={styles.errorItem}>
                <Text style={styles.errorKey}>{error.key}</Text>
                <Text style={styles.errorMessage}>{error.message}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>How to fix</Text>
            <Text style={styles.instructionsItem}>
              1. Create or update your <Text style={styles.code}>.env</Text> file
            </Text>
            <Text style={styles.instructionsItem}>
              2. Copy values from <Text style={styles.code}>.env.example</Text>
            </Text>
            <Text style={styles.instructionsItem}>
              3. Fill in the missing environment variables
            </Text>
            <Text style={styles.instructionsItem}>
              4. Restart the development server
            </Text>
          </View>

          {onClose && (
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.button}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Dismiss</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: "#121212",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.4)",
    padding: 24,
    width: "100%",
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(244, 63, 94, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  iconText: {
    color: "#f87171",
    fontSize: 24,
    fontWeight: "700",
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    color: "#d1d5db",
    marginTop: 4,
  },
  errorList: {
    marginBottom: 20,
  },
  errorItem: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.25)",
    padding: 12,
    marginBottom: 12,
  },
  errorKey: {
    color: "#f87171",
    fontFamily: "Courier",
    fontSize: 12,
    marginBottom: 4,
  },
  errorMessage: {
    color: "#e5e7eb",
  },
  instructions: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.25)",
    padding: 16,
    marginBottom: 20,
  },
  instructionsTitle: {
    color: "#facc15",
    fontWeight: "600",
    marginBottom: 8,
  },
  instructionsItem: {
    color: "#e5e7eb",
    marginBottom: 4,
  },
  code: {
    fontFamily: "Courier",
    backgroundColor: "#374151",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    color: "#f9fafb",
    fontSize: 12,
  },
  button: {
    backgroundColor: "#374151",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#f9fafb",
    fontWeight: "600",
  },
});
