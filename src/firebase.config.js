// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2Qk-UT_fh96ndSPBwUQvgBoQVO8mqltc",
  authDomain: "expert-club-ai.firebaseapp.com",
  projectId: "expert-club-ai",
  storageBucket: "expert-club-ai.firebasestorage.app",
  messagingSenderId: "916538177351",
  appId: "1:916538177351:web:5f3f950f886fa14063fe62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };