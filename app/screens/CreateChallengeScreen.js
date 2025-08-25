// app/screens/CreateChallengeScreen.js
// Val á forstilltum tímum + ræsingu timer, eða halda áfram í handvirku.
import React, { useLayoutEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { useChallengeActivity } from "../context/useChallengeActivity";

const PRESETS = [
  { key: "p5s",   label: "5 sek próf",         ms: 5 * 1000 },
  { key: "p1h",   label: "1 klst",             ms: 1 * 60 * 60 * 1000 },
  { key: "p2h",   label: "2 klst",             ms: 2 * 60 * 60 * 1000 },
  { key: "p4h",   label: "4 klst",             ms: 4 * 60 * 60 * 1000 },
  { key: "p8h",   label: "8 klst",             ms: 8 * 60 * 60 * 1000 },
  { key: "pWknd", label: "Öll helgin (~48 klst)", ms: 48 * 60 * 60 * 1000 },
];

export default function CreateChallengeScreen({ navigation }) {
  const {
    running,
    mode,
    startChallengeWithMs, // (ms, presetObj) => Promise<void>
    startManual,          // () => Promise<void>
  } = useChallengeActivity();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={{ paddingHorizontal: 12 }}
          onPress={() => navigation.dispatch(CommonActions.goBack())}
        >
          <Ionicons name="chevron-back" size={24} color="#66FCF1" />
        </TouchableOpacity>
      ),
      title: "Stjórna / Velja tíma",
    });
  }, [navigation]);

  const goHomeReset = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  const onPick = async (preset) => {
    await startChallengeWithMs(preset.ms, preset);
    goHomeReset();
  };

  const onManual = async () => {
    await startManual();
    goHomeReset();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.presetBtn, item.key === "p5s" && styles.presetPrimary]}
      onPress={() => onPick(item)}
      disabled={running && mode === "timer"}
    >
      <Text style={styles.presetText}>{item.label}</Text>
      <Ionicons name="play-circle" size={22} color="#0B0C10" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Veldu forstilltan tíma</Text>

      <FlatList
        data={PRESETS}
        keyExtractor={(x) => x.key}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
      />

      <View style={{ height: 20 }} />

      <TouchableOpacity style={[styles.presetBtn, styles.manualBtn]} onPress={onManual}>
        <Text style={[styles.presetText, styles.manualText]}>Ræsa handvirkt (telur upp)</Text>
        <Ionicons name="time" size={22} color="#66FCF1" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0C10", paddingVertical: 16 },
  header: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  presetBtn: {
    backgroundColor: "#45A29E",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  presetPrimary: {
    backgroundColor: "#66FCF1",
  },
  presetText: {
    color: "#0B0C10",
    fontSize: 16,
    fontWeight: "700",
  },
  manualBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#66FCF1",
    marginHorizontal: 16,
  },
  manualText: {
    color: "#66FCF1",
  },
});
