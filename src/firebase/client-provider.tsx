'use client';

import React, { useMemo } from 'react';
import { getFirebaseApp, getFirebaseAuth, getFirebaseFirestore } from './config';
import { FirebaseProvider } from './provider';

/**
 * FirebaseClientProvider handles the initialization of Firebase on the client side.
 * This avoids serialization errors when passing Firebase instances from Server to Client components.
 * It imports directly from config to avoid circular dependencies with the index barrel file.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { firebaseApp, firestore, auth } = useMemo(() => {
    const app = getFirebaseApp();
    return {
      firebaseApp: app,
      auth: getFirebaseAuth(app),
      firestore: getFirebaseFirestore(app),
    };
  }, []);

  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
      {children}
    </FirebaseProvider>
  );
};
