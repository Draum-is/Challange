// app/context/useChallengeActivity.js
// Ath: EKKI init-a Firebase hér. App.js import-ar config-ið snemma.

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
  const [running, setRunning] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [challengeDocId, setChallengeDocId] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);

  const startedAtRef = useRef(null);
  const targetAtRef = useRef(null);
  const intervalRef = useRef(null);

  const hasActiveChallenge = running && remainingMs > 0;

  // Niðurteljara-tick
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (running) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, (targetAtRef.current ?? now) - now);
        setRemainingMs(remaining);
        if (remaining <= 0) finishChallengeInternal(false);
      }, 250);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // --- Firestore helpers ---
  async function saveChallenge(startedAt, endsAt, meta = {}) {
    try {
      const userId = firebase.auth().currentUser?.uid ?? "anon";
      const doc = await db.collection("challenges").add({
        userId,
        startedAt,
        endsAt,
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
        { status, updatedAt: firebase.firestore.FieldValue.serverTimestamp(), ...extra },
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
        kind, // "started" | "finished" | "cancelled"
        at: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.warn("saveLightActivity failed", e);
    }
  }

  // --- Public API ---
  async function startChallengeWithMs(ms, preset = null) {
    const now = Date.now();
    const endsAt = now + ms;

    startedAtRef.current = now;
    targetAtRef.current = endsAt;
    setSelectedPreset(preset);
    setRemainingMs(ms);
    setRunning(true);

    const docId = await saveChallenge(
      new Date(now).toISOString(),
      new Date(endsAt).toISOString(),
      {
        preset: preset?.key ?? null,
        presetLabel: preset?.label ?? null,
        durationMs: ms,
      }
    );
    setChallengeDocId(docId);
    await saveLightActivity(docId, "started");
  }

  async function finishChallenge(cancelled = false) {
    await finishChallengeInternal(cancelled);
  }

  async function finishChallengeInternal(cancelled) {
    setRunning(false);

    const id = challengeDocId;
    if (id) {
      try {
        await updateChallengeStatus(
          id,
          cancelled ? "cancelled" : "finished",
          cancelled
            ? { cancelledAt: new Date().toISOString() }
            : { finishedAt: new Date().toISOString() }
        );
        await saveLightActivity(id, cancelled ? "cancelled" : "finished");
      } catch (e) {
        console.warn("finishChallenge update failed", e);
      }
    }

    startedAtRef.current = null;
    targetAtRef.current = null;
    setChallengeDocId(null);
    setRemainingMs(0);
    setSelectedPreset(null);
  }

  async function stopChallenge() {
    await finishChallenge(true);
  }

  const value = useMemo(
    () => ({
      running,
      remainingMs,
      selectedPreset,
      hasActiveChallenge,
      startChallengeWithMs,
      finishChallenge,
      stopChallenge,
    }),
    [running, remainingMs, selectedPreset, hasActiveChallenge]
  );

  return value;
}

export default ChallengeActivityContext;
