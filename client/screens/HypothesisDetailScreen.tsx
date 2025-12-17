import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useStorage } from "@/hooks/useStorage";

type HypothesisDetailRouteProp = RouteProp<RootStackParamList, "HypothesisDetail">;

export default function HypothesisDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const route = useRoute<HypothesisDetailRouteProp>();
  const { getHypothesisCard } = useStorage();

  const card = getHypothesisCard(route.params.cardId);

  if (!card) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText type="body">Hypothesis card not found</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={[styles.section, { backgroundColor: isDark ? Colors.dark.secondary + "10" : Colors.light.secondary + "10", borderLeftColor: isDark ? Colors.dark.secondary : Colors.light.secondary }]}>
        <ThemedText type="h4">{card.statement}</ThemedText>
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>MECHANISM</ThemedText>
        <ThemedText type="body">{card.mechanism.description}</ThemedText>
        
        {card.mechanism.assumptions.length > 0 ? (
          <View style={styles.assumptionsContainer}>
            <ThemedText type="small" style={[styles.subLabel, { color: theme.textSecondary }]}>Assumptions</ThemedText>
            {card.mechanism.assumptions.map((assumption, index) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: theme.textSecondary }]} />
                <ThemedText type="small" style={{ flex: 1 }}>{assumption}</ThemedText>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>SCOPE</ThemedText>
        <InfoRow label="Condition" value={card.scope.condition} />
        {card.scope.population ? <InfoRow label="Population" value={card.scope.population} /> : null}
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>PREDICTIONS</ThemedText>
        {card.predictions.map((prediction, index) => (
          <View key={index} style={styles.predictionItem}>
            <View style={[styles.directionBadge, { backgroundColor: prediction.expectedDirection === "increase" ? (isDark ? Colors.dark.success + "20" : Colors.light.success + "20") : prediction.expectedDirection === "decrease" ? (isDark ? Colors.dark.error + "20" : Colors.light.error + "20") : theme.backgroundSecondary }]}>
              <Feather 
                name={prediction.expectedDirection === "increase" ? "trending-up" : prediction.expectedDirection === "decrease" ? "trending-down" : "minus"} 
                size={14} 
                color={prediction.expectedDirection === "increase" ? (isDark ? Colors.dark.success : Colors.light.success) : prediction.expectedDirection === "decrease" ? (isDark ? Colors.dark.error : Colors.light.error) : theme.textSecondary} 
              />
            </View>
            <ThemedText type="body" style={{ flex: 1, marginLeft: Spacing.sm }}>{prediction.observable}</ThemedText>
          </View>
        ))}
      </View>

      {card.supportingEvidence.length > 0 ? (
        <View style={[styles.section, { backgroundColor: isDark ? Colors.dark.success + "10" : Colors.light.success + "10" }]}>
          <ThemedText type="small" style={[styles.sectionLabel, { color: isDark ? Colors.dark.success : Colors.light.success }]}>SUPPORTING EVIDENCE</ThemedText>
          {card.supportingEvidence.map((evidenceId, index) => (
            <View key={index} style={styles.evidenceItem}>
              <Feather name="check" size={14} color={isDark ? Colors.dark.success : Colors.light.success} />
              <ThemedText type="small" style={{ flex: 1, marginLeft: Spacing.sm }}>{evidenceId}</ThemedText>
            </View>
          ))}
        </View>
      ) : null}

      {card.counterEvidence.length > 0 ? (
        <View style={[styles.section, { backgroundColor: isDark ? Colors.dark.error + "10" : Colors.light.error + "10" }]}>
          <ThemedText type="small" style={[styles.sectionLabel, { color: isDark ? Colors.dark.error : Colors.light.error }]}>COUNTER EVIDENCE</ThemedText>
          {card.counterEvidence.map((evidenceId, index) => (
            <View key={index} style={styles.evidenceItem}>
              <Feather name="x" size={14} color={isDark ? Colors.dark.error : Colors.light.error} />
              <ThemedText type="small" style={{ flex: 1, marginLeft: Spacing.sm }}>{evidenceId}</ThemedText>
            </View>
          ))}
        </View>
      ) : null}

      <View style={[styles.section, { backgroundColor: isDark ? Colors.dark.warning + "10" : Colors.light.warning + "10" }]}>
        <ThemedText type="small" style={[styles.sectionLabel, { color: isDark ? Colors.dark.warning : Colors.light.warning }]}>FALSIFICATION CRITERIA</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
          Observations that would invalidate this hypothesis:
        </ThemedText>
        {card.falsificationCriteria.map((criteria, index) => (
          <View key={index} style={[styles.falsificationItem, { backgroundColor: theme.backgroundRoot }]}>
            <ThemedText type="body" style={{ marginBottom: Spacing.xs }}>{criteria.description}</ThemedText>
            <View style={styles.outcomeRow}>
              <Feather name="alert-triangle" size={12} color={isDark ? Colors.dark.warning : Colors.light.warning} />
              <ThemedText type="small" style={{ flex: 1, marginLeft: Spacing.xs, color: theme.textSecondary }}>
                Decisive: {criteria.decisiveOutcome}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  
  return (
    <View style={styles.infoRow}>
      <ThemedText type="small" style={{ color: theme.textSecondary, width: 100 }}>{label}</ThemedText>
      <ThemedText type="body" style={{ flex: 1 }}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 0,
  },
  sectionLabel: {
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  subLabel: {
    fontWeight: "600",
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  assumptionsContainer: {
    marginTop: Spacing.sm,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: Spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  directionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  evidenceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  falsificationItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  outcomeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
