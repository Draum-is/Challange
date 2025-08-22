// app/screens/CreateChallengeScreen.js
// Blönduð: Handvirkt Start/Stop + Forstilltir tímar (5s, 1/2/4/8 klst, Helgin)
import React, { useLayoutEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { useChallengeActivity } from "../context/useChallengeActivity";

const PRESETS = [
  { key: "p5s", label: "5 sek próf", ms: 5 * 1000 },
  { key: "p1h", label: "1 klst", ms: 1 * 60 * 60 * 1000 },
  { key: "p2h", label: "2 klst", ms: 2 * 60 * 60 * 1000 },
  { key: "p4h", label: "4 klst", ms: 4 * 60 * 60 * 1000 },
  { key: "p8h", label: "8 klst", ms: 8 * 60 * 60 * 1000 },
  { key: "pWknd", label: "Öll helgin (~48 klst)", ms: 48 * 60 * 60 * 1000 },
];

export default function CreateChallengeScreen({ navigation }) {
  const { running, mode, startManual, startChallengeWithMs, stopChallenge } = useChallengeActivity();

  const goHomeReset = () =>
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );

  // „Heim“ ör í hausnum (reset — fer alltaf alla leið heim)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity style={styles.headerBack} onPress={goHomeReset}>
          <Ionicons name="arrow-back" size={22} color="#66FCF1" />
          <Text style={styles.headerBackText}>Heim</Text>
        </TouchableOpacity>
      ),
      gestureEnabled: false,
    });
  }, [navigation]);

  const onPick = (preset) => {
    startChallengeWithMs(preset.ms, preset);
    goHomeReset();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.presetBtn, item.key === "p5s" && styles.presetPrimary]}
      onPress={() => onPick(item)}
      disabled={running && mode === "timer"} // ef timer í gangi, blokkum val til að forðast tvíbyrjun
    >
      <Text style={styles.presetText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stjórna áskorun</Text>

      {/* Handstýrt Start/Stop */}
      {running && mode === "manual" ? (
        <TouchableOpacity
          style={[styles.bigBtn, styles.btnDanger]}
          onPress={() => {
            stopChallenge(false);
            goHomeReset();
          }}
        >
          <Text style={styles.bigBtnText}>Stop (handstýrt)</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.bigBtn}
          onPress={() => {
            startManual();
            goHomeReset();
          }}
          disabled={running && mode === "timer"}
        >
          <Text style={styles.bigBtnText}>Start (handstýrt)</Text>
        </TouchableOpacity>
      )}

      {/* Forstilltir tímar */}
      <Text style={styles.sectionLabel}>Eða veldu forstilltan tíma</Text>
      <FlatList
        data={PRESETS}
        keyExtractor={(it) => it.key}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      {/* Stop hnappur ef timer í gangi */}
      {running && mode === "timer" && (
        <TouchableOpacity
          style={[styles.presetBtn, styles.stopBtn]}
          onPress={() => {
            stopChallenge(false);
            goHomeReset();
          }}
        >
          <Text style={styles.presetText}>Stop (forstilltur)</Text>
        </TouchableOpacity>
      )}

      {/* Neyðar-heim */}
      <TouchableOpacity style={[styles.presetBtn, styles.homeBtn]} onPress={goHomeReset}>
        <Text style={styles.presetText}>Heim</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, color: "#66FCF1", fontWeight: "700", marginBottom: 12 },
  sectionLabel: { color: "#C5C6C7", marginTop: 8, marginBottom: 6 },

  // Handstýrt
  bigBtn: {
    backgroundColor: "#45A29E",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  bigBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  btnDanger: { backgroundColor: "#C3073F" },

  // Preset
  list: { paddingVertical: 8 },
  presetBtn: {
    backgroundColor: "#1F2833",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  presetPrimary: { backgroundColor: "#45A29E" },
  stopBtn: { backgroundColor: "#C3073F", marginTop: 12 },
  homeBtn: { backgroundColor: "#0F141A", marginTop: 8, borderWidth: 1, borderColor: "#2A333C" },
  presetText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600", textAlign: "center" },

  // Header back
  headerBack: { flexDirection: "row", alignItems: "center" },
  headerBackText: { color: "#66FCF1", marginLeft: 6, fontSize: 16 },
});
