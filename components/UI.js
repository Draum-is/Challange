// components/UI.js
import { Pressable, Text, View, StyleSheet, Platform } from "react-native";
import { colors } from "../theme/colors";

export function Screen({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Title({ children, style }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Button({ title, variant="primary", disabled, onPress, style }) {
  const variants = {
    primary:   { bg: colors.primary, fg: colors.white,  border: "transparent" },
    secondary: { bg: colors.white,   fg: colors.primary, border: colors.primary },
    ghost:     { bg: "transparent",  fg: colors.primary, border: "transparent" },
  };
  const v = variants[variant] || variants.primary;

  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={Platform.OS === "android" ? { borderless: false } : undefined}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        { backgroundColor: v.bg, borderColor: v.border },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[styles.btnText, { color: v.fg }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { fontSize: 32, fontWeight: "800", color: colors.primary, marginBottom: 12 },
  btn: {
    height: 52, borderRadius: 14, borderWidth: 1,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 16
  },
  btnText: { fontSize: 16, fontWeight: "700" },
});
