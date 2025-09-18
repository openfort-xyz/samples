import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import {
  getEnvironmentStatus,
  ValidationError,
} from "../../utils/envValidation";
import { EnvValidationModal } from "./EnvValidationModal";

interface EnvValidationWrapperProps {
  children: React.ReactNode;
}

interface EnvironmentStatus {
  isValid: boolean;
  errors: ValidationError[];
}

export function EnvValidationWrapper({ children }: EnvValidationWrapperProps) {
  const [status, setStatus] = useState<EnvironmentStatus | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const envStatus = getEnvironmentStatus();
    setStatus(envStatus);
    setShowModal(!envStatus.isValid);
  }, []);

  if (!status) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f9fafb" />
        <Text style={styles.loadingText}>Checking configuration...</Text>
      </View>
    );
  }

  if (!status.isValid) {
    return (
      <>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Configuration required</Text>
          <Text style={styles.errorSubtitle}>
            Update your environment variables to run the app.
          </Text>
        </View>
        <EnvValidationModal
          visible={showModal}
          errors={status.errors}
          onClose={() => setShowModal(false)}
        />
      </>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#e5e7eb",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: "#f9fafb",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  errorSubtitle: {
    color: "#cbd5f5",
    textAlign: "center",
  },
});
