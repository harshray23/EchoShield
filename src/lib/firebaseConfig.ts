// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "firebase-explorer-3mnk1",
  appId: "1:322431168944:web:0ae9605fc842e1a1f96675",
  storageBucket: "firebase-explorer-3mnk1.firebasestorage.app",
  apiKey: "AIzaSyDWbmtKVoDzKfF823bfGXc7qHypjSB3WDg",
  authDomain: "firebase-explorer-3mnk1.firebaseapp.com",
  messagingSenderId: "322431168944"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
