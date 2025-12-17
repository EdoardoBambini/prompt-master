import React, { useState, useEffect } from "react";
import { ScrollView, View, StyleSheet, ActivityIndicator } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { StepCard } from "@/components/StepCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/Button";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { useStorage } from "@/hooks/useStorage";
import { Session, WORKFLOW_STEPS } from "@/types/reasoning";

type SessionScreenRouteProp = RouteProp<HomeStackParamList, "Session">;

export default function SessionScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const route = useRoute<SessionScreenRouteProp>();
  const { getSession, updateSession, processNextStep, isProcessing } = useStorage();

  const session = getSession(route.params.sessionId);

  if (!session) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText type="body">Session not found</ThemedText>
      </View>
    );
  }

  const currentStepIndex = session.currentStep;
  const completedSteps = session.completedSteps || [];

  const handleContinue = async () => {
    if (currentStepIndex < WORKFLOW_STEPS.length) {
      await processNextStep(session.id);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={[styles.header, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="h4" numberOfLines={2}>{session.problemStatement}</ThemedText>
        <View style={styles.modeContainer}>
          <View style={[styles.modeBadge, { backgroundColor: session.mode === "evidence" ? (isDark ? Colors.dark.primary + "20" : Colors.light.primary + "20") : (isDark ? Colors.dark.secondary + "20" : Colors.light.secondary + "20") }]}>
            <ThemedText type="small" style={{ color: session.mode === "evidence" ? (isDark ? Colors.dark.primary : Colors.light.primary) : (isDark ? Colors.dark.secondary : Colors.light.secondary), fontWeight: "600" }}>
              {session.mode === "evidence" ? "Evidence Mode" : "R&D Roadmap Mode"}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Progress</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Step {Math.min(currentStepIndex + 1, WORKFLOW_STEPS.length)} of {session.mode === "evidence" ? 7 : WORKFLOW_STEPS.length}
          </ThemedText>
        </View>
        <ProgressBar 
          current={currentStepIndex} 
          total={session.mode === "evidence" ? 7 : WORKFLOW_STEPS.length} 
        />
      </View>

      <View style={styles.stepsContainer}>
        {WORKFLOW_STEPS.slice(0, session.mode === "evidence" ? 7 : WORKFLOW_STEPS.length).map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <StepCard
              key={step.id}
              step={step}
              status={isCompleted ? "completed" : isActive ? "active" : "pending"}
              data={session.stepData?.[step.id]}
              isProcessing={isProcessing && isActive}
            />
          );
        })}
      </View>

      {session.status === "in_progress" && currentStepIndex < (session.mode === "evidence" ? 7 : WORKFLOW_STEPS.length) ? (
        <View style={styles.actionContainer}>
          <Button onPress={handleContinue} disabled={isProcessing}>
            {isProcessing ? "Processing..." : `Continue to Step ${currentStepIndex + 2}`}
          </Button>
        </View>
      ) : null}

      {session.status === "stopped" ? (
        <View style={[styles.stopBanner, { backgroundColor: isDark ? Colors.dark.warning + "20" : Colors.light.warning + "20" }]}>
          <Feather name="alert-triangle" size={20} color={isDark ? Colors.dark.warning : Colors.light.warning} />
          <View style={styles.stopContent}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>Process Stopped</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {session.stopReason || "Missing required information to continue."}
            </ThemedText>
          </View>
        </View>
      ) : null}

      {session.status === "completed" ? (
        <View style={[styles.completeBanner, { backgroundColor: isDark ? Colors.dark.success + "20" : Colors.light.success + "20" }]}>
          <Feather name="check-circle" size={20} color={isDark ? Colors.dark.success : Colors.light.success} />
          <ThemedText type="body" style={{ marginLeft: Spacing.sm, fontWeight: "600" }}>
            Analysis Complete
          </ThemedText>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  modeContainer: {
    flexDirection: "row",
    marginTop: Spacing.md,
  },
  modeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  progressSection: {
    marginBottom: Spacing.xl,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  stepsContainer: {
    marginBottom: Spacing.xl,
  },
  actionContainer: {
    marginBottom: Spacing.xl,
  },
  stopBanner: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  stopContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  completeBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
});
