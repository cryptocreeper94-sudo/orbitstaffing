// DarkWave Auth - Firebase Configuration
// Shared authentication across DarkWave Studios ecosystem

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyByHm_Zwo9NGZ3DyHtZ5_wCtHlLXcat23Q",
  authDomain: "darkwave-auth.firebaseapp.com",
  projectId: "darkwave-auth",
  storageBucket: "darkwave-auth.firebasestorage.app",
  messagingSenderId: "41307406912",
  appId: "1:41307406912:web:b70884d2e91d9a922a55a5",
  measurementId: "G-EL9LT61B28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Auth functions
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    return null;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-out error:", error);
  }
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export type { User };
