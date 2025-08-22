// app/context/useChallengeActivity.js
// Blönduð rökfræði: "manual" (telur upp) og "timer" (telur niður).
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

const db = firebase.firestore();

const ChallengeActivityContext = createContext(null);

export function ChallengeActivityProvider({ children }) {
  const value = useProvideChallengeActivity();
  return (
    <ChallengeActivityContext.Provider value={value}>
      {children}
    </ChallengeActivityContext.Provider>
  );
}

export function useChallengeActivity() {
  return useContext(ChallengeActivityContext);
}

function useProvideChallengeActivity() {
  const [mode, setMode] = useState("idle"); // "idle" | "manual" | "timer"
  const [running, setRunning] = useState(false);

  const [elapsedMs, setElapsedMs] = useState(0);     // manual
  const [remainingMs, setRemainingMs] = useState(0); // timer
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [challengeDocId, setChallengeDocId] = useState(null);

  const startedAtRef = useRef(null);
  const targetAtRef = useRef(null);
  const intervalRef = useRef(null);

  // Tick fyrir báðar stillingar
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (running) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        if (mode === "timer") {
          const rem = Math.max(0, (targetAtRef.current ?? now) - now);
          setRemainingMs(rem);
          if (rem <= 0) {
            finishChallengeInternal(false);
          }
        } else if (mode === "manual") {
          const el = Math.max(0, now - (startedAtRef.current ?? now));
          setElapsedMs(el);
        }
      }, 250);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  // --- Firestore helpers ---
  async function saveChallenge(meta = {}) {
    try {
      const userId = firebase.auth().currentUser?.uid ?? "anon";
      const doc = await db.collection("challenges").add({
        userId,
        status: "running",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        ...meta,
      });
      return doc.id;
    } catch (e) {
      console.warn("saveChallenge failed", e);
      return null;
    }
  }

  async function updateChallengeStatus(docId, status, extra = {}) {
    if (!docId) return;
    try {
      await db.collection("challenges").doc(docId).set(
        {
          status,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          ...extra,
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("updateChallengeStatus failed", e);
    }
  }

  async function saveLightActivity(docId, kind) {
    try {
      const userId = firebase.auth().currentUser?.uid ?? "anon";
      await db.collection("challenge_activity").add({
        challengeId: docId ?? null,
        userId,
        kind, // "started" | "finished" | "cancelled" | "stopped"
        at: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.warn("saveLightActivity failed", e);
    }
  }

  // --- Public API ---
  async function startManual() {
    if (running) return;
    const now = Date.now();
    startedAtRef.current = now;
    targetAtRef.current = null;
    setMode("manual");
    setSelectedPreset(null);
    setElapsedMs(0);
    setRunning(true);

    const docId = await saveChallenge({
      mode: "manual",
      startedAt: new Date(now).toISOString(),
    });
    setChallengeDocId(docId);
    await saveLightActivity(docId, "started");
  }

  async function startChallengeWithMs(ms, preset = null) {
    if (running) {
      // leyfum að endurræsa úr manual yfir í timer: stoppa fyrst
      await finishChallengeInternal(true);
    }
    const now = Date.now();
    const endsAt = now + ms;

    startedAtRef.current = now;
    targetAtRef.current = endsAt;

    setMode("timer");
    setSelectedPreset(preset);
    setRemainingMs(ms);
    setElapsedMs(0);
    setRunning(true);

    const docId = await saveChallenge({
      mode: "timer",
      startedAt: new Date(now).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      preset: preset?.key ?? null,
      presetLabel: preset?.label ?? null,
      durationMsPlanned: ms,
    });
    setChallengeDocId(docId);
    await saveLightActivity(docId, "started");
  }

  async function stopChallenge(cancelled = false) {
    await finishChallengeInternal(cancelled);
  }

  async function finishChallengeInternal(cancelled) {
    const wasMode = mode;
    const startedAt = startedAtRef.current;

    setRunning(false);

    const id = challengeDocId;
    const endedAt = Date.now();
    const durationMs =
      startedAt != null ? Math.max(0, endedAt - startedAt) : 0;

    if (id) {
      try {
        await updateChallengeStatus(
          id,
          cancelled ? "cancelled" : "finished",
          {
            endedAt: new Date(endedAt).toISOString(),
            durationMs,
          }
        );
        await saveLightActivity(id, cancelled ? "cancelled" : "finished");
      } catch (e) {
        console.warn("finishChallenge update failed", e);
      }
    }

    // reset local
    startedAtRef.current = null;
    targetAtRef.current = null;
    setChallengeDocId(null);
    setSelectedPreset(null);
    setElapsedMs(0);
    setRemainingMs(0);
    setMode("idle");
  }

  const value = useMemo(
    () => ({
      // state
      mode,
      running,
      elapsedMs,
      remainingMs,
      selectedPreset,
      // actions
      startManual,
      startChallengeWithMs,
      stopChallenge,
    }),
    [mode, running, elapsedMs, remainingMs, selectedPreset]
  );

  return value;
}
