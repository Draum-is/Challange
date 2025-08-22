// App.js
import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 👉 Init Firebase snemma (með .js endingunni til að forðast slóðarvesen)
import "./app/config/firebaseConfig.js";

import HomeScreen from "./app/screens/HomeScreen";
import CreateChallengeScreen from "./app/screens/CreateChallengeScreen";
import { ChallengeActivityProvider } from "./app/context/useChallengeActivity";

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#0B0C10",
    card: "#0B0C10",
    text: "#EEEEEE",
    border: "#1F2833",
    primary: "#66FCF1",
  },
};

export default function App() {
  return (
    <ChallengeActivityProvider>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: "#0B0C10" },
            headerTintColor: "#66FCF1",
            headerTitleStyle: { color: "#EEEEEE" },
            contentStyle: { backgroundColor: "#0B0C10" },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Challenge" }} />
          <Stack.Screen
            name="CreateChallenge"
            component={CreateChallengeScreen}
            options={{ title: "Veldu áskorun", headerBackVisible: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ChallengeActivityProvider>
  );
}



 