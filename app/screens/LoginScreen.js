// app/screens/LoginScreen.js
import React from "react";
import { View, Text } from "react-native";
import { db, auth } from "../../config/firebaseConfig";

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Login Screen (placeholder)</Text>
    </View>
  );
}
