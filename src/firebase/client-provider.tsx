'use client';

import * as React from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FirebaseProvider } from './provider';
import { firebaseConfig } from './config';

/**
 * Client-side Firebase Provider.
 * Initializes Firebase services once on the client and provides them to the app.
 * Direct initialization prevents circular dependencies with the index barrel file.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [services, setServices] = React.useState<{
    firebaseApp: any;
    firestore: any;
    auth: any;
  } | null>(null);

  React.useEffect(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    setServices({
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    });
  }, []);

  if (!services) {
    return null; // Or a loading spinner
  }

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
