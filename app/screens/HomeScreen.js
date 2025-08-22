// app/screens/HomeScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useChallengeActivity } from "../context/useChallengeActivity";

export default function HomeScreen({ navigation }) {
  const {
    running,
    mode,                 // "idle" | "manual" | "timer"
    remainingMs,          // notað fyrir timer
    elapsedMs,            // notað fyrir manual
    selectedPreset,
    stopChallenge,
  } = useChallengeActivity();

  const format = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  const timeText = mode === "timer" ? format(remainingMs) : format(elapsedMs);
  const subLabel =
    mode === "timer"
      ? selectedPreset?.label ?? "Forstilltur tími"
      : running
      ? "Handstýrt (telur upp)"
      : "Búðu til og byrjaðu!";

  return (
    <View style={styles.container}>
      {running ? (
        <>
          <Text style={styles.title}>
            {mode === "timer" ? "Áskorun í gangi (niður)" : "Áskorun í gangi (upp)"}
          </Text>
          <Text style={styles.timer}>{timeText}</Text>
          <Text style={styles.subtitle}>{subLabel}</Text>

          <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => stopChallenge(false)}>
            <Text style={styles.btnText}>Stop</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Engin áskorun í gangi</Text>
          <Text style={styles.subtitle}>{subLabel}</Text>

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
  container: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", color: "#66FCF1", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#C5C6C7", marginBottom: 24, textAlign: "center" },
  timer: { fontSize: 48, color: "#FFFFFF", fontVariant: ["tabular-nums"], marginBottom: 24 },
  btn: {
    backgroundColor: "#45A29E",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 8,
    width: "80%",
    alignItems: "center",
  },
  btnDanger: { backgroundColor: "#C3073F" },
  btnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
