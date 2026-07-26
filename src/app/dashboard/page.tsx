'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ShieldAlert, Zap, Globe, TrendingUp, Search, Info, ShieldCheck, Languages, Target, Activity, ExternalLink, AlertCircle } from 'lucide-react';
import { useFirestore, useUser, useDoc, useCollection } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { AnalysisService } from '@/services/analysis-service';
import { TriageCenter } from '@/components/dashboard/TriageCenter';
import { AnalysisDetails } from '@/components/dashboard/AnalysisDetails';
import { AnalysisLoader } from '@/components/dashboard/AnalysisLoader';
import { ScamMap } from '@/components/dashboard/ScamMap';
import { type AnalyzeScamOutput } from '@/ai/flows/analyze-scam-flow';
import { analyzeTargetingPatterns, type TargetAnalysisOutput } from '@/ai/flows/target-analysis-flow';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { UserProfile, ScamAnalysis } from '@/types';
import { Card } from '@/components/ui/card';
import { extractFirestoreIndexLink } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeScamOutput | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState('English');
  const [targetInsight, setTargetInsight] = useState<TargetAnalysisOutput | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  // STABILIZE REFERENCES: Memoize Firestore refs to prevent infinite render loops
  const userRef = useMemo(() => {
    if (!user?.uid || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user?.uid, db]);

  const { data: profile } = useDoc<UserProfile>(userRef as any);

  const historyQuery = useMemo(() => {
    if (!user?.uid || !db) return null;
    return query(
      collection(db, 'analyses'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
  }, [user?.uid, db]);

  const { data: recentAnalyses, error: analysesError } = useCollection<ScamAnalysis>(historyQuery as any);

  const indexLink = useMemo(() => {
    if (analysesError?.code === 'failed-precondition') {
      return extractFirestoreIndexLink(analysesError.message);
    }
    return null;
  }, [analysesError]);

  const exposureStats = useMemo(() => {
    if (!recentAnalyses || recentAnalyses.length === 0) return [];
    const counts: Record<string, number> = {};
    recentAnalyses.forEach(a => {
      counts[a.scamCategory] = (counts[a.scamCategory] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, percent: (count / recentAnalyses.length) * 100 }))
      .sort((a, b) => b.count - a.count);
  }, [recentAnalyses]);

  useEffect(() => {
    let isMounted = true;
    async function getInsight() {
      if (!user || !recentAnalyses || recentAnalyses.length < 3 || targetInsight || isGeneratingInsight) return;
      
      setIsGeneratingInsight(true);
      try {
        const historyData = recentAnalyses.map(a => ({
          type: a.scamType,
          category: a.scamCategory,
          summary: a.summary
        }));
        
        const insight = await analyzeTargetingPatterns({
          scamHistory: historyData,
          userName: user.displayName || 'Agent'
        });
        
        if (isMounted) {
          setTargetInsight(insight);
        }
      } catch (e) {
        console.warn("Forensic pattern analysis deferred");
      } finally {
        if (isMounted) {
          setIsGeneratingInsight(false);
        }
      }
    }
    getInsight();
    return () => { isMounted = false; };
  }, [recentAnalyses, user?.uid, targetInsight, isGeneratingInsight]);

  const handleAnalyze = async (type: 'text' | 'image' | 'voice' | 'document', content: string) => {
    if (!user) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setCaseId(null);
    setAudioUrl(null);

    try {
      const service = new AnalysisService(db, user.uid, user.displayName || 'Friend');
      const { analysis, warningAudio, caseId: newCaseId } = await service.performAnalysis({ type, content, language });
      
      setTimeout(() => {
        setResult(analysis);
        setCaseId(newCaseId);
        if (warningAudio) setAudioUrl(warningAudio);
        setIsAnalyzing(false);

        toast({
          title: 'Forensic Triage Complete',
          description: `Nova identified a ${analysis.trustLabel} threat.`,
        });
      }, 1500);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Network Intelligence Failure',
        description: 'Unable to establish forensic link. Please try again.',
      });
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-10">
      <header className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-primary/10 pb-8">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">SYSTEM: ACTIVE / FORENSICS DISPATCHED</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
            Guardian Console
          </h1>
          <p className="text-muted-foreground font-medium text-xs max-w-md">
            EchoShield AI threat forensic triaging, network intelligence, and simulation logs.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass-card px-6 py-4 rounded-[2rem] flex items-center gap-4 border-white/40 shadow-sm">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary"><ShieldCheck className="h-6 w-6" /></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Safety Index</span>
              <span className="text-3xl font-black text-primary leading-none">{profile?.safetyScore || 0}</span>
            </div>
          </div>
        </div>
      </header>

      {indexLink && (
        <Alert variant="destructive" className="glass-card border-destructive/50 rounded-2xl bg-destructive/10">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-black uppercase tracking-widest text-[10px]">Database Optimization Required</AlertTitle>
          <AlertDescription className="space-y-3 pt-2">
            <p className="text-sm font-medium">To display history, a composite index must be created.</p>
            <Button size="sm" variant="destructive" className="rounded-xl h-9 px-4 font-bold text-[10px] uppercase tracking-widest" asChild>
              <a href={indexLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Create Index
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <TriageCenter onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <AnalysisLoader key="loader" />
            ) : !result ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="glass-card border-white/40 shadow-sm rounded-[2.5rem] p-6 overflow-hidden relative min-h-[350px]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Live Risk Heatmap</div>
                  <ScamMap />
                </Card>

                <div className="flex flex-col items-center justify-center glass-card rounded-[2.5rem] p-10 text-center border-white/40 shadow-sm min-h-[350px]">
                  <div className="p-4 bg-primary/5 rounded-[2rem] border border-primary/10 mb-4 animate-bounce">
                    <ShieldAlert className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">System Listening</h3>
                  <p className="text-muted-foreground max-w-xs mt-2 text-xs font-medium">
                    Supply a screenshot, chat transcript, or voice sample to trace threats.
                  </p>
                </div>
              </div>
            ) : (
              <AnalysisDetails key="result" result={result} audioUrl={audioUrl} caseId={caseId} />
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-8">
          {(isGeneratingInsight || targetInsight) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 glass-card border-white/40 shadow-sm rounded-[2.5rem] relative overflow-hidden"
            >
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary"><Activity className="h-4 w-4" /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Vector</span>
                </div>
                {isGeneratingInsight ? (
                  <p className="text-xs text-muted-foreground animate-pulse font-medium">Processing signals...</p>
                ) : (
                  <p className="text-xs font-medium leading-relaxed italic text-foreground opacity-90">
                    "{targetInsight?.insight}"
                  </p>
                )}
              </div>
            </motion.div>
          )}

          <div className="glass-card rounded-[2.5rem] p-6 border-white/40 shadow-sm">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-4">
                <Languages className="h-4 w-4" /> Language Matrix
             </div>
             <div className="grid grid-cols-2 gap-2">
               {['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi'].map(lang => (
                 <button 
                   key={lang}
                   onClick={() => setLanguage(lang)}
                   className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
                     language === lang 
                       ? 'bg-primary text-white shadow-md shadow-primary/10' 
                       : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                   }`}
                 >
                   {lang}
                 </button>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
