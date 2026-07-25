'use client';

import * as React from 'react';
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
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = React.useState<T[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<FirestoreError | null>(null);

  React.useEffect(() => {
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
        if (serverError.code === 'permission-denied') {
          let path = 'unknown';
          try {
            path = (query as any)._query?.path?.toString() || 'analyses';
          } catch (e) {}

          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path,
            operation: 'list',
          } satisfies SecurityRuleContext));
        } else {
          // Log non-permission errors (like missing indices) for developer visibility without crashing
          console.warn(`Firestore ${serverError.code}: ${serverError.message}`);
        }
        
        setError(serverError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
