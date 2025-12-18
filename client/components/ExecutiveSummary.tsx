import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { ExecutiveSummaryData, EvidenceStrength } from "@/lib/heuristicParser";

interface ExecutiveSummaryProps {
  data: ExecutiveSummaryData;
  stepName: string;
}

function getStrengthColor(strength: EvidenceStrength, isDark: boolean): string {
  switch (strength) {
    case "HIGH":
      return isDark ? Colors.dark.success : Colors.light.success;
    case "MEDIUM":
      return isDark ? Colors.dark.warning : Colors.light.warning;
    case "LOW":
      return isDark ? Colors.dark.error : Colors.light.error;
  }
}

function getStrengthIcon(strength: EvidenceStrength): keyof typeof Feather.glyphMap {
  switch (strength) {
    case "HIGH":
      return "check-circle";
    case "MEDIUM":
      return "alert-circle";
    case "LOW":
      return "x-circle";
  }
}

export function ExecutiveSummary({ data, stepName }: ExecutiveSummaryProps) {
  const { theme, isDark } = useTheme();
  const strengthColor = getStrengthColor(data.evidenceStrength, isDark);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
      <View style={styles.header}>
        <Feather name="file-text" size={16} color={theme.textSecondary} />
        <ThemedText type="small" style={[styles.headerLabel, { color: theme.textSecondary }]}>
          EXECUTIVE SUMMARY
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          CORE TAKEAWAY
        </ThemedText>
        <View style={styles.claimSection}>
          <ThemedText type="small" style={{ color: isDark ? Colors.dark.success : Colors.light.success, fontWeight: "600", marginBottom: Spacing.xs }}>
            Can be claimed:
          </ThemedText>
          {data.coreTakeaways.canClaim.map((claim, i) => (
            <View key={`can-${i}`} style={styles.bulletRow}>
              <Feather name="check" size={12} color={isDark ? Colors.dark.success : Colors.light.success} style={styles.bulletIcon} />
              <ThemedText type="small" style={styles.bulletText}>{claim}</ThemedText>
            </View>
          ))}
        </View>
        <View style={[styles.claimSection, { marginTop: Spacing.sm }]}>
          <ThemedText type="small" style={{ color: isDark ? Colors.dark.error : Colors.light.error, fontWeight: "600", marginBottom: Spacing.xs }}>
            Cannot be claimed:
          </ThemedText>
          {data.coreTakeaways.cannotClaim.map((claim, i) => (
            <View key={`cannot-${i}`} style={styles.bulletRow}>
              <Feather name="x" size={12} color={isDark ? Colors.dark.error : Colors.light.error} style={styles.bulletIcon} />
              <ThemedText type="small" style={styles.bulletText}>{claim}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.strengthBadge, { backgroundColor: strengthColor + "20", borderColor: strengthColor }]}>
        <Feather name={getStrengthIcon(data.evidenceStrength)} size={16} color={strengthColor} />
        <View style={styles.strengthContent}>
          <ThemedText type="small" style={{ fontWeight: "700", color: strengthColor }}>
            Evidence Strength: {data.evidenceStrength}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>
            {data.evidenceJustification}
          </ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          KEY LIMITATIONS & FAILURE MODES
        </ThemedText>
        {data.limitations.slice(0, 5).map((limitation, i) => (
          <View key={i} style={styles.bulletRow}>
            <Feather name="alert-triangle" size={12} color={isDark ? Colors.dark.warning : Colors.light.warning} style={styles.bulletIcon} />
            <ThemedText type="small" style={styles.bulletText}>{limitation}</ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          NEXT ACTIONS (CONCRETE, TESTABLE)
        </ThemedText>
        {data.nextActions.slice(0, 5).map((action, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={[styles.actionNumber, { backgroundColor: isDark ? Colors.dark.primary + "20" : Colors.light.primary + "20" }]}>
              <ThemedText type="small" style={{ fontWeight: "700", color: isDark ? Colors.dark.primary : Colors.light.primary, fontSize: 10 }}>
                {i + 1}
              </ThemedText>
            </View>
            <ThemedText type="small" style={styles.bulletText}>{action}</ThemedText>
          </View>
        ))}
      </View>

      <View style={[styles.disclaimer, { borderTopColor: theme.border }]}>
        <Feather name="info" size={12} color={theme.textSecondary} />
        <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs, fontStyle: "italic", flex: 1 }}>
          Heuristic extraction from existing text. No additional AI processing.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  headerLabel: {
    marginLeft: Spacing.sm,
    fontWeight: "700",
    letterSpacing: 1,
    fontSize: 11,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionLabel: {
    fontWeight: "700",
    letterSpacing: 0.5,
    fontSize: 10,
    marginBottom: Spacing.sm,
  },
  claimSection: {},
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
  strengthBadge: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  strengthContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  actionNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
});
