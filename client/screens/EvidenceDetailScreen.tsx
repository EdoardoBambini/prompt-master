import React from "react";
import { ScrollView, View, StyleSheet, Linking, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ValidityBar } from "@/components/ValidityBar";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useStorage } from "@/hooks/useStorage";

type EvidenceDetailRouteProp = RouteProp<RootStackParamList, "EvidenceDetail">;

export default function EvidenceDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const route = useRoute<EvidenceDetailRouteProp>();
  const { getEvidenceCard } = useStorage();

  const card = getEvidenceCard(route.params.cardId);

  if (!card) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText type="body">Evidence card not found</ThemedText>
      </View>
    );
  }

  const getValidityColor = (level: string) => {
    switch (level) {
      case "high":
        return isDark ? Colors.dark.success : Colors.light.success;
      case "medium":
        return isDark ? Colors.dark.warning : Colors.light.warning;
      case "low":
        return isDark ? Colors.dark.error : Colors.light.error;
      default:
        return theme.textSecondary;
    }
  };

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
      <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>SOURCE</ThemedText>
        <ThemedText type="body" style={styles.citation}>{card.source.citation}</ThemedText>
        {card.source.link ? (
          <Pressable
            onPress={() => Linking.openURL(card.source.link!)}
            style={({ pressed }) => [styles.linkButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name="external-link" size={16} color={isDark ? Colors.dark.primary : Colors.light.primary} />
            <ThemedText type="small" style={{ color: isDark ? Colors.dark.primary : Colors.light.primary, marginLeft: Spacing.xs }}>
              View Source
            </ThemedText>
          </Pressable>
        ) : null}
        <View style={[styles.typeBadge, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {card.source.type.replace("_", " ").toUpperCase()}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>CONTEXT</ThemedText>
        <InfoRow label="Model" value={card.context.model.replace("_", " ")} />
        {card.context.species ? <InfoRow label="Species" value={card.context.species} /> : null}
        {card.context.population ? <InfoRow label="Population" value={card.context.population} /> : null}
        <InfoRow label="Condition" value={card.context.condition} />
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>INTERVENTION</ThemedText>
        <InfoRow label="Agent" value={card.intervention.agent} />
        {card.intervention.dose ? <InfoRow label="Dose" value={card.intervention.dose} /> : null}
        {card.intervention.route ? <InfoRow label="Route" value={card.intervention.route} /> : null}
        {card.intervention.duration ? <InfoRow label="Duration" value={card.intervention.duration} /> : null}
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>OUTCOME</ThemedText>
        <InfoRow label="Variable" value={card.outcome.variable} />
        <View style={styles.directionRow}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Direction</ThemedText>
          <View style={[styles.directionBadge, { backgroundColor: card.outcome.direction === "increase" ? (isDark ? Colors.dark.success + "20" : Colors.light.success + "20") : card.outcome.direction === "decrease" ? (isDark ? Colors.dark.error + "20" : Colors.light.error + "20") : theme.backgroundSecondary }]}>
            <Feather 
              name={card.outcome.direction === "increase" ? "trending-up" : card.outcome.direction === "decrease" ? "trending-down" : "minus"} 
              size={14} 
              color={card.outcome.direction === "increase" ? (isDark ? Colors.dark.success : Colors.light.success) : card.outcome.direction === "decrease" ? (isDark ? Colors.dark.error : Colors.light.error) : theme.textSecondary} 
            />
            <ThemedText type="small" style={{ marginLeft: Spacing.xs, textTransform: "capitalize" }}>
              {card.outcome.direction.replace("_", " ")}
            </ThemedText>
          </View>
        </View>
        {card.outcome.magnitude ? <InfoRow label="Magnitude" value={card.outcome.magnitude} /> : null}
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>VALIDITY PROFILE</ThemedText>
        <ValidityBar label="Internal Validity" level={card.validityProfile.internalValidity} />
        <ValidityBar label="External Validity" level={card.validityProfile.externalValidity} />
        <ValidityBar label="Mechanistic Validity" level={card.validityProfile.mechanisticValidity} />
        <ValidityBar label="Robustness" level={card.validityProfile.robustness} />
      </View>

      {card.validityProfile.criticalLimitations.length > 0 ? (
        <View style={[styles.section, { backgroundColor: isDark ? Colors.dark.warning + "10" : Colors.light.warning + "10" }]}>
          <ThemedText type="small" style={[styles.sectionLabel, { color: isDark ? Colors.dark.warning : Colors.light.warning }]}>CRITICAL LIMITATIONS</ThemedText>
          {card.validityProfile.criticalLimitations.map((limitation, index) => (
            <View key={index} style={styles.limitationRow}>
              <Feather name="alert-triangle" size={14} color={isDark ? Colors.dark.warning : Colors.light.warning} />
              <ThemedText type="small" style={{ flex: 1, marginLeft: Spacing.sm }}>{limitation}</ThemedText>
            </View>
          ))}
        </View>
      ) : null}
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
  },
  sectionLabel: {
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  citation: {
    fontStyle: "italic",
    marginBottom: Spacing.sm,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  directionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  directionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  limitationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
});
