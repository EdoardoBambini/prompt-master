import React from "react";
import { View, StyleSheet, Pressable, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { Session, WORKFLOW_STEPS } from "@/types/reasoning";

interface SessionCardProps {
  session: Session;
  onPress?: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
}

export function SessionCard({ session, onPress, onDelete, style }: SessionCardProps) {
  const { theme, isDark } = useTheme();

  const getStatusColor = () => {
    switch (session.status) {
      case "in_progress":
        return isDark ? Colors.dark.primary : Colors.light.primary;
      case "completed":
        return isDark ? Colors.dark.success : Colors.light.success;
      case "stopped":
        return isDark ? Colors.dark.warning : Colors.light.warning;
    }
  };

  const getStatusIcon = (): keyof typeof Feather.glyphMap => {
    switch (session.status) {
      case "in_progress":
        return "play-circle";
      case "completed":
        return "check-circle";
      case "stopped":
        return "alert-circle";
    }
  };

  const maxSteps = session.mode === "evidence" ? 7 : WORKFLOW_STEPS.length;
  const progress = Math.min(session.currentStep, maxSteps);
  const progressPercent = (progress / maxSteps) * 100;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.backgroundDefault,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.modeBadge, { backgroundColor: session.mode === "evidence" ? (isDark ? Colors.dark.primary + "20" : Colors.light.primary + "20") : (isDark ? Colors.dark.secondary + "20" : Colors.light.secondary + "20") }]}>
          <Feather
            name={session.mode === "evidence" ? "file-text" : "map"}
            size={12}
            color={session.mode === "evidence" ? (isDark ? Colors.dark.primary : Colors.light.primary) : (isDark ? Colors.dark.secondary : Colors.light.secondary)}
          />
          <ThemedText type="small" style={{ marginLeft: Spacing.xs, fontSize: 11, color: session.mode === "evidence" ? (isDark ? Colors.dark.primary : Colors.light.primary) : (isDark ? Colors.dark.secondary : Colors.light.secondary) }}>
            {session.mode === "evidence" ? "Evidence" : "R&D"}
          </ThemedText>
        </View>
        <View style={styles.statusRow}>
          <Feather name={getStatusIcon()} size={14} color={getStatusColor()} />
          <ThemedText type="small" style={{ marginLeft: Spacing.xs, color: theme.textSecondary, fontSize: 11 }}>
            {formatDate(session.updatedAt)}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="body" numberOfLines={2} style={styles.title}>
        {session.problemStatement}
      </ThemedText>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: getStatusColor(),
                width: `${progressPercent}%`,
              },
            ]}
          />
        </View>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}>
          {progress}/{maxSteps}
        </ThemedText>
      </View>

      {onDelete ? (
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          hitSlop={10}
        >
          <Feather name="trash-2" size={16} color={isDark ? Colors.dark.error : Colors.light.error} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontWeight: "500",
    marginBottom: Spacing.md,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  deleteButton: {
    position: "absolute",
    top: Spacing.lg,
    right: Spacing.lg,
    padding: Spacing.xs,
  },
});
