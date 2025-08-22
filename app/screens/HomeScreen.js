// app/screens/HomeScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useChallengeActivity } from "../context/useChallengeActivity";

export default function HomeScreen({ navigation }) {
  const {
    running,
    remainingMs,
    selectedPreset,
    stopChallenge,
    hasActiveChallenge,
  } = useChallengeActivity();

  const format = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  return (
    <View style={styles.container}>
      {hasActiveChallenge ? (
        <>
          <Text style={styles.title}>Áskorun í gangi</Text>
          <Text style={styles.timer}>{format(remainingMs)}</Text>
          <Text style={styles.subtitle}>
            {selectedPreset?.label ?? "Sérsniðinn tími"}
          </Text>

          <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={stopChallenge}>
            <Text style={styles.btnText}>Stoppa áskorun</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Engin áskorun í gangi</Text>
          <Text style={styles.subtitle}>Búðu til og byrjaðu!</Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("CreateChallenge")}
          >
            <Text style={styles.btnText}>Búa til áskorun</Text>
          </TouchableOpacity>

          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>Flýtipróf</Text>
            <Text style={styles.hintText}>
              Þú getur notað 5 sek. prófið eða sérsniðið tíma (mm:ss) í „Veldu áskorun“.
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", color: "#66FCF1", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#C5C6C7", marginBottom: 24 },
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
  hintBox: {
    marginTop: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#1F2833",
    width: "90%",
  },
  hintTitle: { color: "#66FCF1", fontWeight: "700", marginBottom: 6 },
  hintText: { color: "#C5C6C7" },
});
