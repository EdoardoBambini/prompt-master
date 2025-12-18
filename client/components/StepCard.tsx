import React, { useState, useMemo } from "react";
import { View, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { WorkflowStep } from "@/types/reasoning";
import { parseExecutiveSummary } from "@/lib/heuristicParser";

interface StepCardProps {
  step: WorkflowStep;
  status: "completed" | "active" | "pending";
  data?: any;
  isProcessing?: boolean;
  showExecutiveSummary?: boolean;
}

export function StepCard({ step, status, data, isProcessing, showExecutiveSummary = false }: StepCardProps) {
  const { theme, isDark } = useTheme();
  const [expanded, setExpanded] = useState(status === "active");

  const executiveSummary = useMemo(() => {
    if (!showExecutiveSummary || !data) return null;
    return parseExecutiveSummary(data);
  }, [showExecutiveSummary, data]);

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return isDark ? Colors.dark.success : Colors.light.success;
      case "active":
        return isDark ? Colors.dark.primary : Colors.light.primary;
      case "pending":
        return theme.textSecondary;
    }
  };

  const getStatusIcon = (): keyof typeof Feather.glyphMap => {
    switch (status) {
      case "completed":
        return "check-circle";
      case "active":
        return "play-circle";
      case "pending":
        return "circle";
    }
  };

  const hasData = data && Object.keys(data).length > 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundDefault,
          borderLeftColor: getStatusColor(),
          opacity: status === "pending" ? 0.6 : 1,
        },
      ]}
    >
      <Pressable
        onPress={() => hasData && setExpanded(!expanded)}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          {isProcessing ? (
            <ActivityIndicator size="small" color={getStatusColor()} style={styles.icon} />
          ) : (
            <Feather name={getStatusIcon()} size={20} color={getStatusColor()} style={styles.icon} />
          )}
          <View style={styles.headerText}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>{step.name}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>{step.description}</ThemedText>
          </View>
        </View>
        {hasData ? (
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={theme.textSecondary}
          />
        ) : null}
      </Pressable>

      {expanded && hasData ? (
        <View style={[styles.content, { borderTopColor: theme.border }]}>
          {executiveSummary ? (
            <ExecutiveSummary data={executiveSummary} stepName={step.name} />
          ) : null}
          
          <View style={[styles.fullTextSection, { backgroundColor: isDark ? theme.backgroundRoot : "#F8FAFC" }]}>
            <View style={styles.fullTextHeader}>
              <Feather name="file-text" size={12} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs, fontWeight: "600", fontSize: 10, letterSpacing: 0.5 }}>
                FULL ANALYSIS
              </ThemedText>
            </View>
            {renderStepData(data, theme, isDark)}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function renderStepData(data: any, theme: any, isDark: boolean) {
  if (!data) return null;

  if (data.problemDefinition) {
    return (
      <View>
        <DataRow label="Condition" value={data.problemDefinition.condition} theme={theme} />
        <DataRow label="Unmet Need" value={data.problemDefinition.unmetNeed} theme={theme} />
        <DataRow label="Observable Gap" value={data.problemDefinition.observableGap} theme={theme} />
        {data.problemDefinition.constraints?.map((c: any, i: number) => (
          <DataRow key={i} label={`Constraint ${i + 1}`} value={`[${c.type}] ${c.description}`} theme={theme} />
        ))}
      </View>
    );
  }

  if (data.evidenceCount !== undefined) {
    return (
      <View>
        <DataRow label="Evidence Cards" value={`${data.evidenceCount} found`} theme={theme} />
        {data.sources?.map((source: string, i: number) => (
          <View key={i} style={styles.listItem}>
            <Feather name="file-text" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ flex: 1, marginLeft: Spacing.sm }}>{source}</ThemedText>
          </View>
        ))}
      </View>
    );
  }

  if (data.gaps) {
    return (
      <View>
        {data.gaps.map((gap: string, i: number) => (
          <View key={i} style={styles.listItem}>
            <View style={[styles.gapBadge, { backgroundColor: isDark ? Colors.dark.warning + "20" : Colors.light.warning + "20" }]}>
              <ThemedText type="small" style={{ fontWeight: "600", color: isDark ? Colors.dark.warning : Colors.light.warning }}>
                GAP{i + 1}
              </ThemedText>
            </View>
            <ThemedText type="small" style={{ flex: 1, marginLeft: Spacing.sm }}>{gap}</ThemedText>
          </View>
        ))}
      </View>
    );
  }

  if (data.hypothesesCount !== undefined) {
    return (
      <View>
        <DataRow label="Hypotheses Generated" value={`${data.hypothesesCount}`} theme={theme} />
        {data.hypotheses?.map((h: any, i: number) => (
          <View key={i} style={[styles.hypothesisItem, { borderColor: theme.border }]}>
            <ThemedText type="small" style={{ fontWeight: "600", marginBottom: Spacing.xs }}>
              Hypothesis {i + 1}
            </ThemedText>
            <ThemedText type="small" style={{ lineHeight: 18 }}>{h.statement || h}</ThemedText>
          </View>
        ))}
      </View>
    );
  }

  if (data.critiques) {
    return (
      <View>
        <DataRow label="Critiques Applied" value={`${data.critiques.length || 0}`} theme={theme} />
        {data.critiques?.map((c: any, i: number) => (
          <View key={i} style={[styles.critiqueItem, { borderColor: isDark ? Colors.dark.error + "40" : Colors.light.error + "40" }]}>
            <Feather name="alert-circle" size={14} color={isDark ? Colors.dark.error : Colors.light.error} />
            <ThemedText type="small" style={{ flex: 1, marginLeft: Spacing.sm, lineHeight: 18 }}>
              {c.critique || c}
            </ThemedText>
          </View>
        ))}
      </View>
    );
  }

  if (data.selectedHypothesis) {
    return (
      <View>
        <View style={[styles.selectedBox, { backgroundColor: isDark ? Colors.dark.success + "10" : Colors.light.success + "10", borderColor: isDark ? Colors.dark.success : Colors.light.success }]}>
          <Feather name="check-circle" size={14} color={isDark ? Colors.dark.success : Colors.light.success} />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <ThemedText type="small" style={{ fontWeight: "600", color: isDark ? Colors.dark.success : Colors.light.success }}>
              SELECTED
            </ThemedText>
            <ThemedText type="small" style={{ marginTop: Spacing.xs, lineHeight: 18 }}>{data.selectedHypothesis}</ThemedText>
          </View>
        </View>
        {data.rationale ? (
          <ThemedText type="small" style={{ marginTop: Spacing.md, color: theme.textSecondary, lineHeight: 18 }}>
            Rationale: {data.rationale}
          </ThemedText>
        ) : null}
      </View>
    );
  }

  if (data.roadmap) {
    return (
      <View>
        <DataRow label="Objective" value={data.roadmap.objective || "Research development roadmap"} theme={theme} />
        <DataRow label="Phases" value={`${data.roadmap.phases?.length || 0} defined`} theme={theme} />
        {data.roadmap.phases?.map((phase: any, i: number) => (
          <View key={i} style={[styles.phaseItem, { borderColor: theme.border }]}>
            <ThemedText type="small" style={{ fontWeight: "600" }}>Phase {i + 1}: {phase.goal}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>{phase.method}</ThemedText>
          </View>
        ))}
      </View>
    );
  }

  if (data.summary) {
    return (
      <ThemedText type="small" style={{ lineHeight: 20 }}>{data.summary}</ThemedText>
    );
  }

  if (data.rawText) {
    return (
      <ThemedText type="small" style={{ lineHeight: 20 }}>{data.rawText}</ThemedText>
    );
  }

  return (
    <ThemedText type="small" style={{ color: theme.textSecondary }}>
      Data processed successfully
    </ThemedText>
  );
}

function DataRow({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={styles.dataRow}>
      <ThemedText type="small" style={{ color: theme.textSecondary, width: 100 }}>{label}</ThemedText>
      <ThemedText type="small" style={{ flex: 1, lineHeight: 18 }}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  icon: {
    marginTop: 2,
  },
  headerText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    marginTop: Spacing.sm,
  },
  fullTextSection: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  fullTextHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  dataRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  gapBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  hypothesisItem: {
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  critiqueItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  selectedBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
  },
  phaseItem: {
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
});
