// app/context/ChallengeContext.js
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { db, auth } from "../../config/firebaseConfig";

/**
 * Heldur utan um stöðu áskorunar:
 * - isRunning, remaining, targetSec
 * - Býr til challenge doc við start og uppfærir við lok
 * - Engar tilkynningar hér (engin expo-notifications)
 */

const ChallengeContext = createContext(null);

export function ChallengeProvider({ children }) {
  const [isRunning, setIsRunning] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [targetSec, setTargetSec] = useState(0);

  const timerRef = useRef(null);
  const startedAtRef = useRef(null);
  const challengeDocIdRef = useRef(null);

  const createChallengeDoc = useCallback(async (mode, durationSec) => {
    const user = auth.currentUser || { uid: "anon" };
    const startedAt = new Date();
    startedAtRef.current = startedAt;

    const docRef = await db.collection("challenges").add({
      userId: user.uid,
      mode,
      startedAt,
      durationTargetSec: durationSec,
      createdAt: new Date(),
      lightActivity: null,
    });
    challengeDocIdRef.current = docRef.id;
    return docRef.id;
  }, []);

  const finalizeChallengeDoc = useCallback(async () => {
    const id = challengeDocIdRef.current;
    if (!id) return;
    try {
      await db.collection("challenges").doc(id).set(
        { finishedAt: new Date() },
        { merge: true }
      );
    } catch (e) {
      console.warn("finalizeChallengeDoc failed", e);
    } finally {
      challengeDocIdRef.current = null;
      startedAtRef.current = null;
    }
  }, []);

  const startChallenge = useCallback(
    async ({ mode = "DEV_10S", durationSec = 10 } = {}) => {
      clearInterval(timerRef.current);
      setIsRunning(false);
      setRemaining(durationSec);
      setTargetSec(durationSec);

      await createChallengeDoc(mode, durationSec);

      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setRemaining((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setRemaining(0);
            finalizeChallengeDoc();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    },
    [createChallengeDoc, finalizeChallengeDoc]
  );

  const stopChallenge = useCallback(async () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    await finalizeChallengeDoc();
  }, [finalizeChallengeDoc]);

  const value = useMemo(
    () => ({
      isRunning,
      remaining,
      targetSec,
      startChallenge,
      stopChallenge,
      getChallengeId: () => challengeDocIdRef.current,
      getStartedAt: () => startedAtRef.current,
    }),
    [isRunning, remaining, targetSec, startChallenge, stopChallenge]
  );

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>;
}

export function useChallenge() {
  const ctx = useContext(ChallengeContext);
  if (!ctx) throw new Error("useChallenge must be used within <ChallengeProvider>");
  return ctx;
}
