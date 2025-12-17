import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EvidenceScreen from "@/screens/EvidenceScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

export type EvidenceStackParamList = {
  Evidence: undefined;
};

const Stack = createNativeStackNavigator<EvidenceStackParamList>();

export default function EvidenceStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Evidence"
        component={EvidenceScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Evidence Cards" />,
        }}
      />
    </Stack.Navigator>
  );
}
