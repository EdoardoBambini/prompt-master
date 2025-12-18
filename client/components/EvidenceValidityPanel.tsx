import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { ValidityScores } from "@/lib/heuristicParser";

interface EvidenceValidityPanelProps {
  scores: ValidityScores;
}

function getScoreColor(score: number, isDark: boolean): string {
  if (score >= 70) return isDark ? Colors.dark.success : Colors.light.success;
  if (score >= 40) return isDark ? Colors.dark.warning : Colors.light.warning;
  return isDark ? Colors.dark.error : Colors.light.error;
}

interface ValidityBarProps {
  label: string;
  score: number;
  explanation: string;
  icon: keyof typeof Feather.glyphMap;
  isDark: boolean;
  theme: any;
}

function ValidityBar({ label, score, explanation, icon, isDark, theme }: ValidityBarProps) {
  const color = getScoreColor(score, isDark);

  return (
    <View style={styles.barContainer}>
      <View style={styles.barHeader}>
        <View style={styles.barLabelRow}>
          <Feather name={icon} size={14} color={color} />
          <ThemedText type="small" style={[styles.barLabel, { color: theme.textPrimary }]}>{label}</ThemedText>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: color + "20", borderColor: color }]}>
          <ThemedText type="small" style={{ fontWeight: "700", color, fontSize: 12 }}>{score}</ThemedText>
        </View>
      </View>
      <View style={[styles.trackContainer, { backgroundColor: theme.border }]}>
        <View style={[styles.trackFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <ThemedText type="small" style={[styles.explanation, { color: theme.textSecondary }]}>
        {explanation}
      </ThemedText>
    </View>
  );
}

export function EvidenceValidityPanel({ scores }: EvidenceValidityPanelProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Feather name="shield" size={16} color={theme.textSecondary} />
        <ThemedText type="small" style={[styles.headerLabel, { color: theme.textSecondary }]}>
          EVIDENCE & STUDY VALIDITY
        </ThemedText>
      </View>

      <View style={styles.content}>
        <ValidityBar
          label="Internal Validity / Bias"
          score={scores.internalValidity.score}
          explanation={scores.internalValidity.explanation}
          icon="eye"
          isDark={isDark}
          theme={theme}
        />
        <ValidityBar
          label="External Validity / Generalizability"
          score={scores.externalValidity.score}
          explanation={scores.externalValidity.explanation}
          icon="globe"
          isDark={isDark}
          theme={theme}
        />
        <ValidityBar
          label="Measurement Validity"
          score={scores.measurementValidity.score}
          explanation={scores.measurementValidity.explanation}
          icon="crosshair"
          isDark={isDark}
          theme={theme}
        />
        <ValidityBar
          label="Statistical Robustness"
          score={scores.statisticalRobustness.score}
          explanation={scores.statisticalRobustness.explanation}
          icon="bar-chart-2"
          isDark={isDark}
          theme={theme}
        />
      </View>

      <View style={[styles.disclaimer, { borderTopColor: theme.border }]}>
        <Feather name="info" size={12} color={theme.textSecondary} />
        <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs, fontStyle: "italic", flex: 1 }}>
          Heuristic estimate for decision support only. Not ground truth. Scores derived from text analysis.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerLabel: {
    marginLeft: Spacing.sm,
    fontWeight: "700",
    letterSpacing: 1,
    fontSize: 11,
  },
  content: {
    padding: Spacing.lg,
  },
  barContainer: {
    marginBottom: Spacing.lg,
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  barLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  barLabel: {
    marginLeft: Spacing.sm,
    fontWeight: "600",
  },
  scoreBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    minWidth: 36,
    alignItems: "center",
  },
  trackContainer: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: Spacing.xs,
  },
  trackFill: {
    height: "100%",
    borderRadius: 3,
  },
  explanation: {
    fontSize: 11,
    lineHeight: 16,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
});
