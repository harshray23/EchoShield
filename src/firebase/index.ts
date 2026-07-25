import { getFirebaseApp, getFirebaseAuth, getFirebaseFirestore } from './config';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

export { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  const firebaseApp = getFirebaseApp();
  const auth = getFirebaseAuth(firebaseApp);
  const firestore = getFirebaseFirestore(firebaseApp);

  return { firebaseApp, firestore, auth };
}
