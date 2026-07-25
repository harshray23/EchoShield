'use client';

import React, { useMemo } from 'react';
import { getFirebaseApp, getFirebaseAuth, getFirebaseFirestore } from './config';
import { FirebaseProvider } from './provider';

/**
 * Client-side Firebase Provider.
 * Directly initializes services to avoid circular dependency via the index barrel file.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
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
