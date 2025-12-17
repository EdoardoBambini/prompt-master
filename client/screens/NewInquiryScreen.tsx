import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Typography } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useStorage } from "@/hooks/useStorage";

type InquiryMode = "evidence" | "roadmap";

export default function NewInquiryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { createSession } = useStorage();

  const [problemStatement, setProblemStatement] = useState("");
  const [mode, setMode] = useState<InquiryMode>("evidence");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!problemStatement.trim()) {
      Alert.alert("Required", "Please enter a research question or problem statement.");
      return;
    }

    setIsLoading(true);
    try {
      const session = await createSession(problemStatement.trim(), mode);
      navigation.goBack();
      setTimeout(() => {
        navigation.navigate("Main");
      }, 100);
    } catch (error) {
      Alert.alert("Error", "Failed to create inquiry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>Research Question</ThemedText>
        <ThemedText type="small" style={[styles.sectionDescription, { color: theme.textSecondary }]}>
          Describe the scientific problem or therapeutic question you want to investigate.
        </ThemedText>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="e.g., What are the current therapies for treatment-resistant depression and what evidence supports them?"
          placeholderTextColor={theme.textSecondary}
          value={problemStatement}
          onChangeText={setProblemStatement}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>Analysis Mode</ThemedText>
        <ThemedText type="small" style={[styles.sectionDescription, { color: theme.textSecondary }]}>
          Choose what type of analysis you need.
        </ThemedText>

        <Pressable
          onPress={() => setMode("evidence")}
          style={({ pressed }) => [
            styles.modeCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: mode === "evidence" ? (isDark ? Colors.dark.primary : Colors.light.primary) : theme.border,
              borderWidth: mode === "evidence" ? 2 : 1,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <View style={[styles.modeIcon, { backgroundColor: isDark ? Colors.dark.primary + "20" : Colors.light.primary + "20" }]}>
            <Feather name="file-text" size={24} color={isDark ? Colors.dark.primary : Colors.light.primary} />
          </View>
          <View style={styles.modeContent}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>Evidence Mode</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Map existing therapies, evidence, validity, contradictions, and gaps (Steps 1-7)
            </ThemedText>
          </View>
          {mode === "evidence" ? (
            <Feather name="check-circle" size={20} color={isDark ? Colors.dark.primary : Colors.light.primary} />
          ) : null}
        </Pressable>

        <Pressable
          onPress={() => setMode("roadmap")}
          style={({ pressed }) => [
            styles.modeCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: mode === "roadmap" ? (isDark ? Colors.dark.secondary : Colors.light.secondary) : theme.border,
              borderWidth: mode === "roadmap" ? 2 : 1,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <View style={[styles.modeIcon, { backgroundColor: isDark ? Colors.dark.secondary + "20" : Colors.light.secondary + "20" }]}>
            <Feather name="map" size={24} color={isDark ? Colors.dark.secondary : Colors.light.secondary} />
          </View>
          <View style={styles.modeContent}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>R&D Roadmap Mode</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Full analysis with hypothesis generation and gated roadmap (Steps 1-9)
            </ThemedText>
          </View>
          {mode === "roadmap" ? (
            <Feather name="check-circle" size={20} color={isDark ? Colors.dark.secondary : Colors.light.secondary} />
          ) : null}
        </Pressable>
      </View>

      <View style={[styles.disclaimer, { backgroundColor: isDark ? Colors.dark.warning + "10" : Colors.light.warning + "10" }]}>
        <Feather name="alert-circle" size={16} color={isDark ? Colors.dark.warning : Colors.light.warning} />
        <ThemedText type="small" style={[styles.disclaimerText, { color: theme.textSecondary }]}>
          This platform provides research information only. It does not provide medical advice, dosages, or treatment protocols.
        </ThemedText>
      </View>

      <Button onPress={handleSubmit} disabled={isLoading || !problemStatement.trim()}>
        {isLoading ? "Creating..." : "Start Analysis"}
      </Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    marginBottom: Spacing.md,
  },
  textArea: {
    minHeight: 120,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.body.fontSize,
  },
  modeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  modeContent: {
    flex: 1,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  disclaimerText: {
    flex: 1,
  },
});
