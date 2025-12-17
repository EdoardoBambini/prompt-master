import React, { useState } from "react";
import { View, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { WorkflowStep } from "@/types/reasoning";

interface StepCardProps {
  step: WorkflowStep;
  status: "completed" | "active" | "pending";
  data?: any;
  isProcessing?: boolean;
}

export function StepCard({ step, status, data, isProcessing }: StepCardProps) {
  const { theme, isDark } = useTheme();
  const [expanded, setExpanded] = useState(status === "active");

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
          {renderStepData(data, theme, isDark)}
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
      </View>
    );
  }

  if (data.summary) {
    return (
      <ThemedText type="small">{data.summary}</ThemedText>
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
      <ThemedText type="small" style={{ flex: 1 }}>{value}</ThemedText>
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
  dataRow: {
    flexDirection: "row",
    marginBottom: Spacing.xs,
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
});
