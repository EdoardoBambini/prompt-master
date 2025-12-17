import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { EvidenceCard as EvidenceCardType, ValidityLevel } from "@/types/reasoning";

interface EvidenceCardProps {
  card: EvidenceCardType;
  compact?: boolean;
  onPress?: () => void;
}

function getValidityColor(level: ValidityLevel, isDark: boolean): string {
  switch (level) {
    case "high":
      return isDark ? Colors.dark.success : Colors.light.success;
    case "medium":
      return isDark ? Colors.dark.warning : Colors.light.warning;
    case "low":
      return isDark ? Colors.dark.error : Colors.light.error;
  }
}

function getOverallValidity(profile: EvidenceCardType["validityProfile"]): ValidityLevel {
  const levels = [profile.internalValidity, profile.externalValidity, profile.mechanisticValidity, profile.robustness];
  const counts = { high: 0, medium: 0, low: 0 };
  levels.forEach(l => counts[l]++);
  if (counts.high >= 3) return "high";
  if (counts.low >= 2) return "low";
  return "medium";
}

export function EvidenceCard({ card, compact = false, onPress }: EvidenceCardProps) {
  const { theme, isDark } = useTheme();
  const overallValidity = getOverallValidity(card.validityProfile);
  const borderColor = getValidityColor(overallValidity, isDark);

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.compactCard,
          {
            backgroundColor: theme.backgroundDefault,
            borderLeftColor: borderColor,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <View style={styles.compactHeader}>
          <View style={[styles.typeBadge, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="small" style={{ color: theme.textSecondary, fontSize: 11 }}>
              {card.source.type.replace("_", " ").toUpperCase()}
            </ThemedText>
          </View>
          <View style={[styles.validityBadge, { backgroundColor: borderColor + "20" }]}>
            <ThemedText type="small" style={{ color: borderColor, fontWeight: "600", fontSize: 11 }}>
              {overallValidity.toUpperCase()}
            </ThemedText>
          </View>
        </View>
        <ThemedText type="body" numberOfLines={2} style={{ marginBottom: Spacing.xs }}>
          {card.intervention.agent} - {card.outcome.variable}
        </ThemedText>
        <ThemedText type="small" numberOfLines={1} style={{ color: theme.textSecondary }}>
          {card.context.condition}
        </ThemedText>
        <View style={styles.directionRow}>
          <Feather
            name={card.outcome.direction === "increase" ? "trending-up" : card.outcome.direction === "decrease" ? "trending-down" : "minus"}
            size={14}
            color={card.outcome.direction === "increase" ? (isDark ? Colors.dark.success : Colors.light.success) : card.outcome.direction === "decrease" ? (isDark ? Colors.dark.error : Colors.light.error) : theme.textSecondary}
          />
          <ThemedText type="small" style={{ marginLeft: Spacing.xs, textTransform: "capitalize" }}>
            {card.outcome.direction.replace("_", " ")}
          </ThemedText>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.backgroundDefault,
          borderLeftColor: borderColor,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {card.source.type.replace("_", " ").toUpperCase()}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={18} color={theme.textSecondary} />
      </View>
      <ThemedText type="body" style={{ fontWeight: "600", marginBottom: Spacing.xs }}>
        {card.intervention.agent}
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
        {card.context.condition} | {card.context.model.replace("_", " ")}
      </ThemedText>
      <View style={styles.outcomeRow}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>Outcome:</ThemedText>
        <View style={styles.directionBadge}>
          <Feather
            name={card.outcome.direction === "increase" ? "trending-up" : card.outcome.direction === "decrease" ? "trending-down" : "minus"}
            size={14}
            color={card.outcome.direction === "increase" ? (isDark ? Colors.dark.success : Colors.light.success) : card.outcome.direction === "decrease" ? (isDark ? Colors.dark.error : Colors.light.error) : theme.textSecondary}
          />
          <ThemedText type="small" style={{ marginLeft: Spacing.xs }}>
            {card.outcome.variable}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    marginBottom: Spacing.md,
  },
  compactCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  compactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  validityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  outcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  directionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  directionBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
});
