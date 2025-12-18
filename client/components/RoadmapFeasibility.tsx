import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { PhaseFeasibility } from "@/lib/heuristicParser";

interface RoadmapFeasibilityProps {
  phases: PhaseFeasibility[];
}

interface PhaseCardProps {
  phase: PhaseFeasibility;
  index: number;
  isDark: boolean;
  theme: any;
}

function PhaseCard({ phase, index, isDark, theme }: PhaseCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const phaseColors = [
    isDark ? Colors.dark.primary : Colors.light.primary,
    isDark ? Colors.dark.secondary : Colors.light.secondary,
    isDark ? Colors.dark.warning : Colors.light.warning,
    isDark ? Colors.dark.error : Colors.light.error,
  ];
  const color = phaseColors[index % phaseColors.length];

  return (
    <View style={[styles.phaseCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
      <Pressable onPress={() => setExpanded(!expanded)} style={styles.phaseHeader}>
        <View style={[styles.phaseIndicator, { backgroundColor: color }]}>
          <ThemedText type="small" style={{ fontWeight: "700", color: "#fff", fontSize: 10 }}>
            {index + 1}
          </ThemedText>
        </View>
        <View style={styles.phaseHeaderContent}>
          <ThemedText type="body" style={{ fontWeight: "700" }}>{phase.phase}</ThemedText>
          <View style={styles.phaseMetrics}>
            <View style={styles.metricBadge}>
              <Feather name="clock" size={10} color={theme.textSecondary} />
              <ThemedText type="small" style={{ marginLeft: 4, color: theme.textSecondary }}>{phase.duration}</ThemedText>
            </View>
            <View style={[styles.metricBadge, { marginLeft: Spacing.sm }]}>
              <Feather name="dollar-sign" size={10} color={theme.textSecondary} />
              <ThemedText type="small" style={{ marginLeft: 2, color: theme.textSecondary }}>{phase.costRange}</ThemedText>
            </View>
          </View>
        </View>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={18} color={theme.textSecondary} />
      </Pressable>

      {expanded ? (
        <View style={[styles.phaseContent, { borderTopColor: theme.border }]}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="alert-triangle" size={14} color={isDark ? Colors.dark.error : Colors.light.error} />
              <ThemedText type="small" style={[styles.sectionLabel, { color: isDark ? Colors.dark.error : Colors.light.error }]}>
                PRIMARY FAILURE RISKS
              </ThemedText>
            </View>
            {phase.failureRisks.map((risk, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: isDark ? Colors.dark.error : Colors.light.error }]} />
                <ThemedText type="small" style={styles.bulletText}>{risk}</ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="check-square" size={14} color={isDark ? Colors.dark.success : Colors.light.success} />
              <ThemedText type="small" style={[styles.sectionLabel, { color: isDark ? Colors.dark.success : Colors.light.success }]}>
                GO / NO-GO DECISION CRITERIA
              </ThemedText>
            </View>
            {phase.goNoGoDecisions.map((decision, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: isDark ? Colors.dark.success : Colors.light.success }]} />
                <ThemedText type="small" style={styles.bulletText}>{decision}</ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="file-text" size={14} color={isDark ? Colors.dark.warning : Colors.light.warning} />
              <ThemedText type="small" style={[styles.sectionLabel, { color: isDark ? Colors.dark.warning : Colors.light.warning }]}>
                REGULATORY BOTTLENECKS
              </ThemedText>
            </View>
            {phase.regulatoryBottlenecks.map((bottleneck, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: isDark ? Colors.dark.warning : Colors.light.warning }]} />
                <ThemedText type="small" style={styles.bulletText}>{bottleneck}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function RoadmapFeasibility({ phases }: RoadmapFeasibilityProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <View style={[styles.header, { backgroundColor: isDark ? Colors.dark.error + "10" : Colors.light.error + "10", borderBottomColor: theme.border }]}>
        <Feather name="alert-octagon" size={18} color={isDark ? Colors.dark.error : Colors.light.error} />
        <View style={styles.headerContent}>
          <ThemedText type="body" style={{ fontWeight: "700", color: isDark ? Colors.dark.error : Colors.light.error }}>
            R&D FEASIBILITY, COSTS & TIMELINES
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>
            Conservative estimates. Most drug development programs fail.
          </ThemedText>
        </View>
      </View>

      <View style={styles.phasesContainer}>
        {phases.map((phase, index) => (
          <PhaseCard key={phase.phase} phase={phase} index={index} isDark={isDark} theme={theme} />
        ))}
      </View>

      <View style={[styles.warningBanner, { backgroundColor: isDark ? Colors.dark.warning + "15" : Colors.light.warning + "15" }]}>
        <Feather name="alert-circle" size={16} color={isDark ? Colors.dark.warning : Colors.light.warning} />
        <View style={styles.warningContent}>
          <ThemedText type="small" style={{ fontWeight: "600", color: isDark ? Colors.dark.warning : Colors.light.warning }}>
            CRITICAL REALITY CHECK
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs, lineHeight: 18 }}>
            Overall probability of success from preclinical to approval: ~5-10%. Phase II failures are 
            most common (50-60%). These estimates assume ideal execution and may not account for 
            competitive, regulatory, or market changes.
          </ThemedText>
        </View>
      </View>

      <View style={[styles.disclaimer, { borderTopColor: theme.border }]}>
        <Feather name="info" size={12} color={theme.textSecondary} />
        <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs, fontStyle: "italic", flex: 1 }}>
          Order-of-magnitude estimates based on industry benchmarks. Actual timelines and costs vary significantly by therapeutic area, modality, and geography.
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
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  phasesContainer: {
    padding: Spacing.md,
  },
  phaseCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  phaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  phaseIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseHeaderContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  phaseMetrics: {
    flexDirection: "row",
    marginTop: Spacing.xs,
  },
  metricBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  phaseContent: {
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    marginLeft: Spacing.sm,
    fontWeight: "700",
    letterSpacing: 0.5,
    fontSize: 10,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
    paddingLeft: Spacing.sm,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
    marginRight: Spacing.sm,
  },
  bulletText: {
    flex: 1,
    lineHeight: 18,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  warningContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
});
