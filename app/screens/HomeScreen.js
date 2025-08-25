// app/screens/HomeScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useChallengeActivity } from "../context/useChallengeActivity";

export default function HomeScreen({ navigation }) {
  const {
    // state
    running,              // boolean
    mode,                 // "idle" | "manual" | "timer"
    remainingMs,          // ef mode === "timer"
    elapsedMs,            // ef mode === "manual"
    selectedPreset,       // { key, label, ms } eða null
    // actions
    stopChallenge,        // () => Promise<void>
  } = useChallengeActivity();

  const format = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => n.toString().padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  const title = running
    ? mode === "timer"
      ? "Áskorun í gangi (Niðurtalning)"
      : "Áskorun í gangi (Handvirk)"
    : "Engin áskorun í gangi";

  const subLabel = running
    ? selectedPreset?.label ?? (mode === "manual" ? "Handvirkt tímatal" : "Ónefnd stilling")
    : "Veldu forstilltan tíma eða ræstu handvirkt";

  const timerText = running
    ? mode === "timer"
      ? format(remainingMs)
      : format(elapsedMs)
    : "--:--";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subLabel}</Text>

      <Text style={styles.timer}>{timerText}</Text>

      {running ? (
        <TouchableOpacity
          style={[styles.btn, styles.btnDanger]}
          onPress={stopChallenge}
        >
          <Text style={styles.btnText}>Stoppa áskorun</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("CreateChallenge")}
          >
            <Text style={styles.btnText}>Stjórna / Velja tíma</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0C10",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#C5C6C7",
    marginBottom: 24,
    textAlign: "center",
  },
  timer: {
    fontSize: 48,
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"],
    marginBottom: 24,
  },
  btn: {
    backgroundColor: "#45A29E",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 8,
    width: "80%",
    alignItems: "center",
  },
  btnDanger: {
    backgroundColor: "#C3073F",
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
