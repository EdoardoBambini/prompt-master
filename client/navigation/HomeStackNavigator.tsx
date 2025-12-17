import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "@/screens/HomeScreen";
import SessionScreen from "@/screens/SessionScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

export type HomeStackParamList = {
  Home: undefined;
  Session: { sessionId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="SciReason" showIcon />,
        }}
      />
      <Stack.Screen
        name="Session"
        component={SessionScreen}
        options={{
          headerTitle: "Reasoning Session",
        }}
      />
    </Stack.Navigator>
  );
}
