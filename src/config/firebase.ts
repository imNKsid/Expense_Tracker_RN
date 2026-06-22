// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrxoF5N2Lj7NADZswu2qIfCeoht7jgYns",
  authDomain: "expense-tracker-9e58a.firebaseapp.com",
  projectId: "expense-tracker-9e58a",
  storageBucket: "expense-tracker-9e58a.firebasestorage.app",
  messagingSenderId: "504524318125",
  appId: "1:504524318125:web:6ddc705d55cbc2a4b12d24",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// For Authentication
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// For database
export const firestore = getFirestore(app);
