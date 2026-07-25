
'use client';

import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { AnalysisDetails } from '@/components/dashboard/AnalysisDetails';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { use, useMemo } from 'react';
import { ScamAnalysis } from '@/types';

export default function CaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useFirestore();
  
  // STABILIZE REFERENCES: doc() must be memoized
  const docRef = useMemo(() => {
    if (!db || !id) return null;
    return doc(db, 'analyses', id);
  }, [db, id]);

  const { data: analysis, loading, error } = useDoc<ScamAnalysis>(docRef);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Accessing Forensic Record...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-8 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-6" />
        <h1 className="text-3xl font-black uppercase">Case Not Found</h1>
        <p className="text-muted-foreground mt-2 max-w-sm">The forensic ID provided does not exist in our archive or access has been restricted.</p>
        <Button asChild className="mt-8 rounded-xl" variant="outline">
          <Link href="/dashboard/history"><ArrowLeft className="mr-2 h-4 w-4" /> Return to Archive</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="flex items-center justify-between">
        <Button asChild variant="ghost" className="rounded-xl text-muted-foreground hover:text-primary transition-colors">
          <Link href="/dashboard/history">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Archive
          </Link>
        </Button>
        <div className="text-right">
          <span className="text-[10px] font-black tracking-widest uppercase text-primary/50 block">Authenticated Access</span>
          <span className="text-[10px] font-black text-white/40 block">CHAIN OF CUSTODY VERIFIED</span>
        </div>
      </header>

      <AnalysisDetails 
        result={analysis as any} 
        audioUrl={null} 
        caseId={id} 
      />
    </div>
  );
}
