
'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

/**
 * Hook to subscribe to a Firestore collection query.
 * @param query The Firestore query to listen to.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...(doc.data() as any),
          id: doc.id,
        })) as T[];
        setData(items);
        setLoading(false);
        setError(null);
      },
      async (serverError: FirestoreError) => {
        // Safe path extraction for debugging context
        let path = 'analyses';
        try {
          // Attempt to extract the collection path from the query object for better debugging context
          const internalQuery = (query as any)._query || query;
          path = internalQuery.path?.segments?.join('/') || internalQuery.path?.toString() || 'analyses';
        } catch (e) {
          path = 'analyses';
        }
        
        const permissionError = new FirestorePermissionError({
          path,
          operation: 'list',
        } satisfies SecurityRuleContext);
        
        // Emit the error for the global listener (FirebaseErrorListener)
        errorEmitter.emit('permission-error', permissionError);
        
        setError(serverError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
