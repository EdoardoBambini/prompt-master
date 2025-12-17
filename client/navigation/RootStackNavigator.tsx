import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import NewInquiryScreen from "@/screens/NewInquiryScreen";
import EvidenceDetailScreen from "@/screens/EvidenceDetailScreen";
import HypothesisDetailScreen from "@/screens/HypothesisDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  NewInquiry: undefined;
  EvidenceDetail: { cardId: string };
  HypothesisDetail: { cardId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
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
    </Stack.Navigator>
  );
}
