// app/config/firebaseConfig.js
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwMcF1vrk8ZSy667Zk4cVyAcaZIOt-3gI",
  authDomain: "challenge-fe8bc.firebaseapp.com",
  projectId: "challenge-fe8bc",
  storageBucket: "challenge-fe8bc.firebasestorage.app",
  messagingSenderId: "941220454726",
  appId: "1:941220454726:web:f205f41c726ad7cd3e4547",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Ath: engar db.settings(...) – þetta var að valda „overriding host“ viðvörun
export default firebase;
