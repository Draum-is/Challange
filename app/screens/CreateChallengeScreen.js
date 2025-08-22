// app/screens/CreateChallengeScreen.js
import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
  const { startChallengeWithMs, running, stopChallenge } = useChallengeActivity();

  // --- „Heim“ ör í hausnum — fer ALLA LEIÐ heim (reset) ---
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: "Home" }] })}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={22} color="#66FCF1" />
          <Text style={styles.headerBackText}>Heim</Text>
        </TouchableOpacity>
      ),
      // tryggjum að system back geri sama (Android back gesture/hnappur)
      gestureEnabled: false,
    });
  }, [navigation]);

  // --- Sérsniðinn tími ---
  const [customInput, setCustomInput] = useState("");

  const parseCustomMs = (val) => {
    if (!val) return 0;
    const t = String(val).trim();
    if (t.includes(":")) {
      const [mmRaw, ssRaw] = t.split(":");
      const mm = parseInt(mmRaw || "0", 10);
      const ss = parseInt(ssRaw || "0", 10);
      if (isNaN(mm) || isNaN(ss)) return 0;
      return Math.max(0, (mm * 60 + ss) * 1000);
    }
    const mins = parseInt(t, 10);
    if (isNaN(mins)) return 0;
    return Math.max(0, mins * 60 * 1000);
  };

  const startCustom = () => {
    const ms = parseCustomMs(customInput);
    if (ms > 0) {
      Keyboard.dismiss();
      startChallengeWithMs(ms, { key: "custom", label: "Sérsniðinn tími" });
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    }
  };

  const onPick = (preset) => {
    startChallengeWithMs(preset.ms, preset);
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.presetBtn, item.key === "p5s" && styles.presetPrimary]}
      onPress={() => onPick(item)}
      disabled={running}
    >
      <Text style={styles.presetText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.info}>Veldu tímalengd fyrir áskorunina</Text>

      {/* Sérsníða */}
      <View style={styles.customBox}>
        <Text style={styles.customLabel}>Sérsníða (mm:ss eða mínútur)</Text>
        <View style={styles.customRow}>
          <TextInput
            value={customInput}
            onChangeText={setCustomInput}
            placeholder="t.d. 10 eða 05:00"
            placeholderTextColor="#7A8A8E"
            keyboardType="numeric"
            style={styles.input}
            maxLength={5}
            returnKeyType="done"
            onSubmitEditing={startCustom}
          />
          <TouchableOpacity
            style={[
              styles.startBtn,
              customInput.trim().length === 0 && styles.startBtnDisabled,
            ]}
            onPress={startCustom}
            disabled={customInput.trim().length === 0}
          >
            <Text style={styles.startBtnText}>Byrja</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hintSmall}>
          Dæmi: <Text style={styles.codeText}>10</Text> (10 mín) eða{" "}
          <Text style={styles.codeText}>0:30</Text> (30 sek)
        </Text>
      </View>

      {/* Forstillt */}
      <FlatList
        data={PRESETS}
        keyExtractor={(it) => it.key}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      {/* Stoppa ef eitthvað er í gangi */}
      {running && (
        <TouchableOpacity style={[styles.presetBtn, styles.stopBtn]} onPress={stopChallenge}>
          <Text style={styles.presetText}>Stoppa áskorun</Text>
        </TouchableOpacity>
      )}

      {/* Belt & axlabönd: heim-takki neðst sem reset-ar ALLTAF */}
      <TouchableOpacity
        style={[styles.presetBtn, styles.homeBtn]}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: "Home" }] })}
      >
        <Text style={styles.presetText}>Heim</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  info: { color: "#C5C6C7", marginBottom: 12 },
  list: { paddingVertical: 8 },

  // Preset
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
  presetText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },

  // Header back
  headerBack: { flexDirection: "row", alignItems: "center" },
  headerBackText: { color: "#66FCF1", marginLeft: 6, fontSize: 16 },

  // Custom time
  customBox: {
    backgroundColor: "#151A21",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  customLabel: { color: "#C5C6C7", marginBottom: 8, fontWeight: "600" },
  customRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: {
    flex: 1,
    backgroundColor: "#0F141A",
    color: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  startBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#45A29E",
  },
  startBtnDisabled: { opacity: 0.5 },
  startBtnText: { color: "#fff", fontWeight: "700" },
  hintSmall: { color: "#7A8A8E", marginTop: 6 },
  codeText: { fontFamily: "monospace", color: "#9AD6D2" },
});
