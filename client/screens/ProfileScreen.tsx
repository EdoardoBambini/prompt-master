import React from "react";
import { ScrollView, View, StyleSheet, Pressable, Alert } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { useStorage } from "@/hooks/useStorage";

function SettingsItem({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  destructive = false,
  showArrow = true,
}: { 
  icon: keyof typeof Feather.glyphMap; 
  title: string; 
  subtitle?: string; 
  onPress?: () => void; 
  destructive?: boolean;
  showArrow?: boolean;
}) {
  const { theme, isDark } = useTheme();
  
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsItem,
        { 
          backgroundColor: theme.backgroundDefault,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.settingsIcon, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather 
          name={icon} 
          size={20} 
          color={destructive ? (isDark ? Colors.dark.error : Colors.light.error) : theme.text} 
        />
      </View>
      <View style={styles.settingsContent}>
        <ThemedText 
          type="body" 
          style={destructive ? { color: isDark ? Colors.dark.error : Colors.light.error } : undefined}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {showArrow ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const { clearAllData } = useStorage();

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your research sessions, evidence cards, and hypotheses. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: clearAllData,
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "About SciReason",
      "Version 1.0.0\n\nSciReason is a Scientific Reasoning Engine that transforms research questions into structured evidence maps, hypothesis cards, and R&D roadmaps.\n\nThis platform is for research and decision-support only. Always consult medical professionals for clinical advice.",
      [{ text: "OK" }]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={[styles.avatarContainer, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.avatar, { backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary }]}>
          <Feather name="activity" size={32} color="#FFFFFF" />
        </View>
        <ThemedText type="h4" style={styles.userName}>Researcher</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Scientific Reasoning Engine
        </ThemedText>
      </View>

      <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        GENERAL
      </ThemedText>
      <View style={[styles.settingsGroup, { backgroundColor: theme.backgroundDefault }]}>
        <SettingsItem
          icon="info"
          title="About"
          subtitle="Version and information"
          onPress={handleAbout}
        />
      </View>

      <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        DATA
      </ThemedText>
      <View style={[styles.settingsGroup, { backgroundColor: theme.backgroundDefault }]}>
        <SettingsItem
          icon="trash-2"
          title="Clear All Data"
          subtitle="Delete all sessions and cards"
          onPress={handleClearData}
          destructive
        />
      </View>

      <View style={styles.disclaimer}>
        <Feather name="alert-circle" size={16} color={theme.textSecondary} />
        <ThemedText type="small" style={[styles.disclaimerText, { color: theme.textSecondary }]}>
          This platform provides research information only. Consult medical professionals for clinical advice.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    fontWeight: "600",
  },
  settingsGroup: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingsContent: {
    flex: 1,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  disclaimerText: {
    flex: 1,
  },
});
