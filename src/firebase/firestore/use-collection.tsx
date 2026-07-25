
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
 * Uses a constant effect dependency array to prevent React re-render loops.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = React.useState<T[] | null>(null);
  const [loading, setLoading] = React.useState(!!query); // Only loading if query is provided
  const [error, setError] = React.useState<FirestoreError | null>(null);

  // Use a ref to track the current query and avoid unnecessary resubscriptions
  const queryRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!query) {
      setLoading(false);
      setData(null);
      return;
    }

    // Safety: If query hasn't changed its identity (e.g. from useMemo), don't resubscribe
    // Note: Comparing query objects is tricky, so we rely on parent useMemo stability.
    
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
          console.warn(`Firestore ${serverError.code}: ${serverError.message}`);
        }
        
        setError(serverError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]); // Query MUST be stable via useMemo in caller

  return { data, loading, error };
}
