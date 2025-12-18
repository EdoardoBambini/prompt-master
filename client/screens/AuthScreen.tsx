import React, { useState } from "react";
import { View, StyleSheet, Alert, ActivityIndicator, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

type AuthMode = "login" | "register";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { login, register } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = mode === "login" 
        ? await login(email.trim(), password)
        : await register(email.trim(), password);

      if (!result.success) {
        Alert.alert("Error", result.error || "Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={[
        styles.container,
        { 
          paddingTop: insets.top + Spacing["3xl"],
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? Colors.dark.primary + "20" : Colors.light.primary + "20" }]}>
          <Feather name="activity" size={40} color={isDark ? Colors.dark.primary : Colors.light.primary} />
        </View>
        <ThemedText type="h2" style={styles.title}>SciReason</ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Scientific Decision Support Platform
        </ThemedText>
      </View>

      <View style={[styles.form, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="h3" style={styles.formTitle}>
          {mode === "login" ? "Sign In" : "Create Account"}
        </ThemedText>

        <View style={styles.inputGroup}>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
            Email
          </ThemedText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
            Password
          </ThemedText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
          />
        </View>

        {mode === "register" ? (
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
              Confirm Password
            </ThemedText>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              autoComplete="new-password"
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
            />
          </View>
        ) : null}

        <Button onPress={handleSubmit} disabled={isSubmitting} style={styles.submitButton}>
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            mode === "login" ? "Sign In" : "Create Account"
          )}
        </Button>

        <View style={styles.toggleContainer}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          </ThemedText>
          <Pressable onPress={toggleMode}>
            <ThemedText type="small" style={{ color: isDark ? Colors.dark.primary : Colors.light.primary, fontWeight: "600" }}>
              {mode === "login" ? "Create one" : "Sign in"}
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Feather name="shield" size={14} color={theme.textSecondary} />
        <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs, flex: 1, lineHeight: 18 }}>
          This is a research decision-support tool, not medical advice. Always consult qualified professionals for clinical decisions.
        </ThemedText>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
  },
  form: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  formTitle: {
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  input: {
    height: 48,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 16,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.md,
  },
});
