import React from "react";
import { FlatList, View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { SessionCard } from "@/components/SessionCard";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { useStorage } from "@/hooks/useStorage";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { sessions, currentSession } = useStorage();

  const activeSessions = sessions.filter(s => s.status === "in_progress");
  const recentSessions = sessions.filter(s => s.status === "completed").slice(0, 3);

  const renderEmpty = () => (
    <View style={styles.welcomeContainer}>
      <View style={[styles.welcomeIcon, { backgroundColor: isDark ? Colors.dark.primary + "20" : Colors.light.primary + "20" }]}>
        <Feather name="search" size={40} color={isDark ? Colors.dark.primary : Colors.light.primary} />
      </View>
      <ThemedText type="h3" style={styles.welcomeTitle}>Welcome to SciReason</ThemedText>
      <ThemedText type="body" style={[styles.welcomeText, { color: theme.textSecondary }]}>
        Transform research questions into structured evidence maps, hypothesis cards, and R&D roadmaps.
      </ThemedText>
      <View style={styles.featureList}>
        <FeatureItem icon="file-text" title="Evidence Cards" description="Structured scientific evidence with validity profiles" />
        <FeatureItem icon="git-branch" title="Hypothesis Generation" description="Generate falsifiable hypotheses from gaps" />
        <FeatureItem icon="map" title="R&D Roadmaps" description="Decision-gated research development plans" />
      </View>
      <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
        Tap the + button to start a new inquiry
      </ThemedText>
    </View>
  );

  const renderContent = () => {
    if (sessions.length === 0) {
      return renderEmpty();
    }

    return (
      <View>
        {activeSessions.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              ACTIVE SESSIONS
            </ThemedText>
            {activeSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onPress={() => navigation.navigate("Session", { sessionId: session.id })}
              />
            ))}
          </View>
        ) : null}

        {recentSessions.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              RECENT
            </ThemedText>
            {recentSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onPress={() => navigation.navigate("Session", { sessionId: session.id })}
                style={{ marginBottom: Spacing.md }}
              />
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl + 70,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={[1]}
      renderItem={() => renderContent()}
      keyExtractor={() => "content"}
    />
  );
}

function FeatureItem({ icon, title, description }: { icon: keyof typeof Feather.glyphMap; title: string; description: string }) {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.featureItem, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.featureIcon, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name={icon} size={20} color={isDark ? Colors.dark.primary : Colors.light.primary} />
      </View>
      <View style={styles.featureContent}>
        <ThemedText type="body" style={{ fontWeight: "600" }}>{title}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>{description}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  welcomeIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  welcomeText: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  featureList: {
    width: "100%",
    marginBottom: Spacing["2xl"],
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  hint: {
    textAlign: "center",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
    fontWeight: "600",
  },
});
