// app/context/useChallengeActivity.js
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { db, auth } from "../config/firebaseConfig";

const ChallengeActivityContext = createContext(null);

export function ChallengeActivityProvider({ children }) {
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("idle"); // "idle" | "manual" | "timer"
  const [selectedPreset, setSelectedPreset] = useState(null);

  const timerIdRef = useRef(null);
  const startedAtRef = useRef(null);
  const endAtRef = useRef(null);
  const activeDocIdRef = useRef(null);

  const [remainingMs, setRemainingMs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const clearTick = () => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  };

  const createActivityDoc = async (payload) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return null;
      const ref = await db.collection("activities").add({
        userId: uid,
        createdAt: new Date(),
        ...payload,
      });
      return ref.id;
    } catch (err) {
      console.warn("createActivityDoc error:", err);
      return null;
    }
  };

  const updateActivityDoc = async (docId, patch) => {
    try {
      if (!docId) return;
      await db.collection("activities").doc(docId).update(patch);
    } catch (err) {
      console.warn("updateActivityDoc error:", err);
    }
  };

  const startChallengeWithMs = async (ms, preset) => {
    clearTick();
    const now = Date.now();
    startedAtRef.current = now;
    endAtRef.current = now + ms;

    setSelectedPreset(preset ?? { key: "custom", label: "Custom", ms });
    setMode("timer");
    setRunning(true);
    setRemainingMs(ms);
    setElapsedMs(0);

    activeDocIdRef.current = await createActivityDoc({
      type: "timer",
      preset: preset ?? { key: "custom", label: "Custom", ms },
      startTimestamp: new Date(now),
      status: "running",
      plannedMs: ms,
    });

    timerIdRef.current = setInterval(() => {
      const left = Math.max(0, endAtRef.current - Date.now());
      setRemainingMs(left);
      if (left <= 0) stopChallenge();
    }, 250);
  };

  const startManual = async () => {
    clearTick();
    const now = Date.now();
    startedAtRef.current = now;
    endAtRef.current = null;

    setSelectedPreset(null);
    setMode("manual");
    setRunning(true);
    setRemainingMs(0);
    setElapsedMs(0);

    activeDocIdRef.current = await createActivityDoc({
      type: "manual",
      startTimestamp: new Date(now),
      status: "running",
    });

    timerIdRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startedAtRef.current);
    }, 250);
  };

  const stopChallenge = async () => {
    clearTick();
    const start = startedAtRef.current ?? Date.now();
    const stop = Date.now();

    let totalMs = 0;
    if (mode === "timer") totalMs = Math.max(0, (endAtRef.current ?? stop) - start);
    if (mode === "manual") totalMs = Math.max(0, stop - start);

    await updateActivityDoc(activeDocIdRef.current, {
      status: "stopped",
      stopTimestamp: new Date(stop),
      durationMs: totalMs,
    });

    activeDocIdRef.current = null;
    startedAtRef.current = null;
    endAtRef.current = null;

    setRunning(false);
    setMode("idle");
    setSelectedPreset(null);
    setRemainingMs(0);
    setElapsedMs(0);
  };

  useEffect(() => () => clearTick(), []);

  const value = useMemo(
    () => ({
      running,
      mode,
      selectedPreset,
      remainingMs,
      elapsedMs,
      startChallengeWithMs,
      startManual,
      stopChallenge,
    }),
    [running, mode, selectedPreset, remainingMs, elapsedMs]
  );

  return (
    <ChallengeActivityContext.Provider value={value}>
      {children}
    </ChallengeActivityContext.Provider>
  );
}

export function useChallengeActivity() {
  const ctx = useContext(ChallengeActivityContext);
  if (!ctx) throw new Error("useChallengeActivity must be used within a ChallengeActivityProvider");
  return ctx;
}

// Einnig default export á hookinu (styður bæði `import use...` og `{ use... }`)
export default useChallengeActivity;



