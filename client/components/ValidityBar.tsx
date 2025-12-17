import React from "react";
import { View, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { ValidityLevel } from "@/types/reasoning";

interface ValidityBarProps {
  label: string;
  level: ValidityLevel;
}

export function ValidityBar({ label, level }: ValidityBarProps) {
  const { theme, isDark } = useTheme();

  const getColor = () => {
    switch (level) {
      case "high":
        return isDark ? Colors.dark.success : Colors.light.success;
      case "medium":
        return isDark ? Colors.dark.warning : Colors.light.warning;
      case "low":
        return isDark ? Colors.dark.error : Colors.light.error;
    }
  };

  const getWidth = () => {
    switch (level) {
      case "high":
        return "100%";
      case "medium":
        return "60%";
      case "low":
        return "30%";
    }
  };

  const color = getColor();

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText type="small">{label}</ThemedText>
        <View style={[styles.levelBadge, { backgroundColor: color + "20" }]}>
          <ThemedText type="small" style={{ color, fontWeight: "600", textTransform: "uppercase", fontSize: 11 }}>
            {level}
          </ThemedText>
        </View>
      </View>
      <View style={[styles.barContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <View
          style={[
            styles.barFill,
            {
              backgroundColor: color,
              width: getWidth(),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  barContainer: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
});
