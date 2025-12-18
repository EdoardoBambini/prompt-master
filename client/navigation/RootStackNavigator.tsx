import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import NewInquiryScreen from "@/screens/NewInquiryScreen";
import EvidenceDetailScreen from "@/screens/EvidenceDetailScreen";
import HypothesisDetailScreen from "@/screens/HypothesisDetailScreen";
import AuthScreen from "@/screens/AuthScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  NewInquiry: undefined;
  EvidenceDetail: { cardId: string };
  HypothesisDetail: { cardId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.backgroundRoot }}>
        <ActivityIndicator size="large" color={theme.link} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!isAuthenticated ? (
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NewInquiry"
            component={NewInquiryScreen}
            options={{
              presentation: "modal",
              headerTitle: "New Inquiry",
            }}
          />
          <Stack.Screen
            name="EvidenceDetail"
            component={EvidenceDetailScreen}
            options={{
              presentation: "modal",
              headerTitle: "Evidence Card",
            }}
          />
          <Stack.Screen
            name="HypothesisDetail"
            component={HypothesisDetailScreen}
            options={{
              presentation: "modal",
              headerTitle: "Hypothesis Card",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
