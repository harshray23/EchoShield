'use client';

import React, { useMemo } from 'react';
import { getFirebaseApp, getFirebaseAuth, getFirebaseFirestore } from './config';
import { FirebaseProvider } from './provider';

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
