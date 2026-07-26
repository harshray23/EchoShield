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
      <header className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Fingerprint className="h-10 w-10 text-primary" />
            Guardian Console
          </h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.4em] opacity-70">
            Nova AI Protection // Forensic Safety Protocol
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-4 border-primary/20">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><ShieldCheck className="h-5 w-5" /></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Safety Score</span>
              <span className="text-2xl font-black text-primary">{profile?.safetyScore || 0}</span>
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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="space-y-8">
          <TriageCenter onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          
          <div className="glass-card rounded-2xl p-6 border-white/5">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-4">
                <Languages className="h-4 w-4" /> Regional Support
             </div>
             <div className="grid grid-cols-2 gap-2">
               {['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi'].map(lang => (
                 <button 
                   key={lang}
                   onClick={() => setLanguage(lang)}
                   className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${language === lang ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
                 >
                   {lang}
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div className="xl:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <AnalysisLoader key="loader" />
            ) : !result ? (
              <div className="space-y-8">
                {(isGeneratingInsight || targetInsight) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 glass-card border-primary/30 rounded-[3rem] relative overflow-hidden"
                  >
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                      <div className="p-6 bg-primary/10 rounded-[2rem] border border-primary/20 cyber-glow shrink-0">
                        <Activity className="h-12 w-12 text-primary" />
                      </div>
                      <div className="space-y-3 flex-1">
                        <h4 className="text-xl font-black uppercase tracking-tighter text-primary">Nova's Targeting Analysis</h4>
                        {isGeneratingInsight ? (
                          <p className="text-sm text-muted-foreground animate-pulse font-medium">Analyzing patterns...</p>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-sm font-medium leading-relaxed italic text-white/90">
                              "{targetInsight?.insight}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[400px]">
                   <Card className="glass-card border-white/5 rounded-[3rem] p-8 overflow-hidden relative">
                      <ScamMap />
                   </Card>

                   <div className="flex flex-col items-center justify-center glass-card rounded-[3rem] p-12 text-center border-white/5">
                    <ShieldAlert className="h-24 w-24 text-white/5 mb-4" />
                    <h3 className="text-2xl font-bold uppercase tracking-tight">Nova is Listening</h3>
                    <p className="text-muted-foreground max-w-sm mt-2 text-sm font-medium">
                      Upload forensic evidence above to initiate protection.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <AnalysisDetails key="result" result={result} audioUrl={audioUrl} caseId={caseId} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
