import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {Array.from({ length: total }).map((_, index) => {
        const isCompleted = index < current;
        const isActive = index === current;

        return (
          <View
            key={index}
            style={[
              styles.segment,
              {
                backgroundColor: isCompleted
                  ? (isDark ? Colors.dark.success : Colors.light.success)
                  : isActive
                    ? (isDark ? Colors.dark.primary : Colors.light.primary)
                    : "transparent",
              },
              index === 0 && styles.firstSegment,
              index === total - 1 && styles.lastSegment,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    gap: 2,
  },
  segment: {
    flex: 1,
  },
  firstSegment: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  lastSegment: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
});
