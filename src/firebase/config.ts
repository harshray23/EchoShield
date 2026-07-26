if (typeof globalThis !== 'undefined') {
  try {
    const g = globalThis as any;
    if (g.localStorage && typeof g.localStorage.getItem !== 'function') {
      delete g.localStorage;
    }
  } catch (e) {
    // safe fallback
  }
}

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "firebase-explorer-3mnk1",
  appId: "1:322431168944:web:0ae9605fc842e1a1f96675",
  storageBucket: "firebase-explorer-3mnk1.firebasestorage.app",
  apiKey: "AIzaSyDWbmtKVoDzKfF823bfGXc7qHypjSB3WDg",
  authDomain: "firebase-explorer-3mnk1.firebaseapp.com",
  messagingSenderId: "322431168944"
};

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

export function getFirebaseAuth(app: FirebaseApp): Auth {
  return getAuth(app);
}

export function getFirebaseFirestore(app: FirebaseApp): Firestore {
  return getFirestore(app);
}
