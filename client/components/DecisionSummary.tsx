import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { DecisionSummaryData, ConfidenceLevel } from "@/lib/heuristicParser";

interface DecisionSummaryProps {
  data: DecisionSummaryData;
}

function getConfidenceColor(level: ConfidenceLevel, isDark: boolean): string {
  switch (level) {
    case "HIGH":
      return isDark ? Colors.dark.success : Colors.light.success;
    case "MEDIUM":
      return isDark ? Colors.dark.warning : Colors.light.warning;
    case "LOW":
      return isDark ? Colors.dark.error : Colors.light.error;
  }
}

export function DecisionSummary({ data }: DecisionSummaryProps) {
  const { theme, isDark } = useTheme();
  const confidenceColor = getConfidenceColor(data.confidenceLevel, isDark);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Feather name="target" size={18} color={isDark ? Colors.dark.secondary : Colors.light.secondary} />
        <ThemedText type="body" style={[styles.headerTitle, { color: isDark ? Colors.dark.secondary : Colors.light.secondary }]}>
          DECISION SUMMARY
        </ThemedText>
        <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + "20", borderColor: confidenceColor }]}>
          <ThemedText type="small" style={{ fontWeight: "700", color: confidenceColor, fontSize: 10 }}>
            {data.confidenceLevel} CONFIDENCE
          </ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            BEST CURRENT ANSWER (CAUTIOUS)
          </ThemedText>
          <View style={[styles.answerBox, { backgroundColor: isDark ? theme.backgroundRoot : "#F8FAFC" }]}>
            <ThemedText type="body" style={{ lineHeight: 22 }}>{data.bestCurrentAnswer}</ThemedText>
          </View>
        </View>

        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              STILL UNKNOWN
            </ThemedText>
            {data.unknowns.map((unknown, i) => (
              <View key={i} style={styles.bulletRow}>
                <Feather name="help-circle" size={12} color={isDark ? Colors.dark.warning : Colors.light.warning} style={styles.bulletIcon} />
                <ThemedText type="small" style={styles.bulletText} numberOfLines={3}>{unknown}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {data.selectedHypothesis ? (
          <View style={styles.section}>
            <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              SELECTED HYPOTHESIS
            </ThemedText>
            <View style={[styles.hypothesisBox, { borderColor: isDark ? Colors.dark.success : Colors.light.success, backgroundColor: (isDark ? Colors.dark.success : Colors.light.success) + "10" }]}>
              <Feather name="check-circle" size={14} color={isDark ? Colors.dark.success : Colors.light.success} />
              <ThemedText type="small" style={{ flex: 1, marginLeft: Spacing.sm }}>{data.selectedHypothesis}</ThemedText>
            </View>
          </View>
        ) : null}

        {data.rejectedHypotheses.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              REJECTED HYPOTHESES (WITH REASONS)
            </ThemedText>
            {data.rejectedHypotheses.map((rejected, i) => (
              <View key={i} style={[styles.rejectedBox, { borderColor: isDark ? Colors.dark.error : Colors.light.error, backgroundColor: (isDark ? Colors.dark.error : Colors.light.error) + "10" }]}>
                <View style={styles.rejectedHeader}>
                  <Feather name="x-circle" size={14} color={isDark ? Colors.dark.error : Colors.light.error} />
                  <ThemedText type="small" style={{ flex: 1, marginLeft: Spacing.sm, fontWeight: "600" }}>{rejected.hypothesis}</ThemedText>
                </View>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs, marginLeft: 22 }}>
                  Reason: {rejected.reason}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            TOP 3 NEXT DECISIONS
          </ThemedText>
          {data.nextDecisions.slice(0, 3).map((decision, i) => (
            <View key={i} style={styles.decisionRow}>
              <View style={[styles.decisionNumber, { backgroundColor: isDark ? Colors.dark.primary + "20" : Colors.light.primary + "20" }]}>
                <ThemedText type="small" style={{ fontWeight: "700", color: isDark ? Colors.dark.primary : Colors.light.primary }}>
                  {i + 1}
                </ThemedText>
              </View>
              <ThemedText type="small" style={styles.bulletText}>{decision}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Feather name="alert-circle" size={12} color={theme.textSecondary} />
        <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs, fontStyle: "italic", flex: 1 }}>
          Conservative assessment. Most drug development programs fail. Default to LOW confidence unless clearly justified.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontWeight: "700",
    letterSpacing: 1,
  },
  confidenceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontWeight: "700",
    letterSpacing: 0.5,
    fontSize: 10,
    marginBottom: Spacing.sm,
  },
  answerBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  twoColumn: {
    marginBottom: Spacing.lg,
  },
  column: {
    flex: 1,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  bulletIcon: {
    marginTop: 2,
    marginRight: Spacing.sm,
  },
  bulletText: {
    flex: 1,
    lineHeight: 18,
  },
  hypothesisBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  rejectedBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  rejectedHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  decisionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  decisionNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
});
