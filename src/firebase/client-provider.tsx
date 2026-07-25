'use client';

import * as React from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FirebaseProvider } from './provider';

const firebaseConfig = {
  projectId: "firebase-explorer-3mnk1",
  appId: "1:322431168944:web:0ae9605fc842e1a1f96675",
  storageBucket: "firebase-explorer-3mnk1.firebasestorage.app",
  apiKey: "AIzaSyDWbmtKVoDzKfF823bfGXc7qHypjSB3WDg",
  authDomain: "fir-explorer-3mnk1.firebaseapp.com",
  messagingSenderId: "322431168944"
};

/**
 * Client-side Firebase Provider.
 * Self-initializes to bypass circular dependency via the index barrel file.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const services = React.useMemo(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
  }, []);

  return (
    <FirebaseProvider 
      firebaseApp={services.firebaseApp} 
      firestore={services.firestore} 
      auth={services.auth}
    >
      {children}
    </FirebaseProvider>
  );
};
