import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LibraryScreen from "@/screens/LibraryScreen";
import SessionScreen from "@/screens/SessionScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

export type LibraryStackParamList = {
  Library: undefined;
  Session: { sessionId: string };
};

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export default function LibraryStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Research Library" />,
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
