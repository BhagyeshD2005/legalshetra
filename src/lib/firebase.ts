// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// This is a public configuration and it's safe to be exposed.
// Security is enforced by Firebase Security Rules.
const firebaseConfig = {
  apiKey: "AIzaSyA-7Mr5wc8141QxXkX6yCQe7hfkvsvKsZ0",
  authDomain: "indilaw-ai-research.firebaseapp.com",
  projectId: "indilaw-ai-research",
  storageBucket: "indilaw-ai-research.firebasestorage.app",
  messagingSenderId: "1061576709161",
  appId: "1:1061576709161:web:cadbb2a201dadcaf653838"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
