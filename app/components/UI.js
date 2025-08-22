// app/components/UI.js
import React from "react";
import { SafeAreaView, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export function Screen({ children, style }) {
  return <SafeAreaView style={[styles.screen, style]}>{children}</SafeAreaView>;
}

export function Title({ children, style }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Button({ title, onPress, style, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && { opacity: 0.9 },
        disabled && { opacity: 0.5 },
        style,
      ]}
      android_ripple={{ color: "#ddd" }}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});
