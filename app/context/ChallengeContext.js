// app/context/ChallengeContext.js

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../config/firebaseConfig";

// Býr til context
const ChallengeContext = createContext();

// Provider fyrir appið
export const ChallengeProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState([]);

  // Fylgjast með innskráðum notanda
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Næ öll challenge úr Firestore þegar user breytist
  useEffect(() => {
    if (user) {
      const unsubscribe = db
        .collection("challenges")
        .where("owner", "==", user.uid)
        .onSnapshot((snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setChallenges(data);
        });
      return () => unsubscribe();
    } else {
      setChallenges([]);
    }
  }, [user]);

  return (
    <ChallengeContext.Provider value={{ user, challenges }}>
      {children}
    </ChallengeContext.Provider>
  );
};

// Hook til að nota context
export const useChallenges = () => {
  return useContext(ChallengeContext);
};
