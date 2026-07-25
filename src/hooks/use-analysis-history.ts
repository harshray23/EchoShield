
'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { ScamAnalysis } from '@/types';

export function useAnalysisHistory() {
  const { user } = useUser();
  const db = useFirestore();

  // STABILIZE REFERENCES: query() must be memoized
  const historyQuery = useMemo(() => {
    if (!user?.uid || !db) return null;
    return query(
      collection(db, 'analyses'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
  }, [user?.uid, db]);

  const { data: analyses, loading, error } = useCollection<ScamAnalysis>(historyQuery);

  return { analyses, loading, error };
}
