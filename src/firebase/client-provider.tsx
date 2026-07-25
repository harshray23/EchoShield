'use client';

import React, { useMemo } from 'react';
import { getFirebaseApp, getFirebaseAuth, getFirebaseFirestore } from './config';
import { FirebaseProvider } from './provider';

/**
 * Client-side Firebase Provider.
 * Ensures Firebase services are initialized exactly once in the browser.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // useMemo ensures we don't re-initialize on every render, though getFirebaseApp is idempotent.
  const services = useMemo(() => {
    const app = getFirebaseApp();
    return {
      firebaseApp: app,
      auth: getFirebaseAuth(app),
      firestore: getFirebaseFirestore(app),
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
