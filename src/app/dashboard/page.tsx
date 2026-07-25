
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

  const userRef = user ? doc(db, 'users', user.uid) : null;
  const { data: profile } = useDoc<UserProfile>(userRef as any);

  // Fetch recent history for exposure analysis
  const historyQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'analyses'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
  }, [user, db]);

  const { data: recentAnalyses, error: analysesError } = useCollection<ScamAnalysis>(historyQuery);

  // Extract index link if query fails
  const indexLink = useMemo(() => {
    if (analysesError?.code === 'failed-precondition') {
      return extractFirestoreIndexLink(analysesError.message);
    }
    return null;
  }, [analysesError]);

  // Calculate Scam Exposure Distribution
  const exposureStats = useMemo(() => {
    if (!recentAnalyses) return [];
    const counts: Record<string, number> = {};
    recentAnalyses.forEach(a => {
      counts[a.scamCategory] = (counts[a.scamCategory] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, percent: (count / recentAnalyses.length) * 100 }))
      .sort((a, b) => b.count - a.count);
  }, [recentAnalyses]);

  // Generate targeting insight when history changes
  useEffect(() => {
    async function getInsight() {
      if (!user || !recentAnalyses || recentAnalyses.length < 3 || targetInsight) return;
      
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
        setTargetInsight(insight);
      } catch (e) {
        console.error("Failed to generate targeting insight", e);
      } finally {
        setIsGeneratingInsight(false);
      }
    }
    getInsight();
  }, [recentAnalyses, user, targetInsight]);

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
          description: `Nova identified a ${analysis.trustLabel} threat. Check the results.`,
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

      {/* Index Requirement Alert */}
      {indexLink && (
        <Alert variant="destructive" className="glass-card border-destructive/50 rounded-2xl bg-destructive/10">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-black uppercase tracking-widest text-[10px]">Database Optimization Required</AlertTitle>
          <AlertDescription className="space-y-3 pt-2">
            <p className="text-sm font-medium">To display your recent scan history, a composite index must be created in the Firebase Console.</p>
            <Button size="sm" variant="destructive" className="rounded-xl h-9 px-4 font-bold text-[10px] uppercase tracking-widest" asChild>
              <a href={indexLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-3 w-3" /> Create Required Index
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="space-y-8">
          <TriageCenter onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          
          <div className="glass-card rounded-[2rem] p-6 border-white/5 space-y-6">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
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

          {/* Scam Exposure Chart */}
          {exposureStats.length > 0 && (
            <Card className="glass-card border-white/5 rounded-[2rem] p-6">
              <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest mb-6">
                <Target className="h-4 w-4" /> Your Scam Exposure
              </div>
              <div className="space-y-4">
                {exposureStats.slice(0, 5).map(stat => (
                  <div key={stat.name} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                      <span className="text-muted-foreground truncate max-w-[120px]">{stat.name}</span>
                      <span className="text-primary">{Math.round(stat.percent)}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percent}%` }}
                        className="h-full bg-primary shadow-[0_0_10px_rgba(0,183,255,0.3)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="glass-card border-white/5 rounded-[2rem] p-6 bg-primary/5">
             <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest mb-4">
                <TrendingUp className="h-4 w-4" /> Today's Trending Scams
             </div>
             <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-medium border-b border-white/5 pb-2">
                   <span>🏦 RBI KYC Fraud</span>
                   <span className="text-destructive font-black">HIGH</span>
                </div>
                <div className="flex items-center justify-between text-xs font-medium border-b border-white/5 pb-2">
                   <span>📦 Courier Delay scam</span>
                   <span className="text-orange-500 font-black">MED</span>
                </div>
                <div className="flex items-center justify-between text-xs font-medium">
                   <span>🎓 Student Aid scam</span>
                   <span className="text-accent font-black">NEW</span>
                </div>
             </div>
          </Card>
        </div>

        <div className="xl:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <AnalysisLoader key="loader" />
            ) : !result ? (
              <div className="space-y-8">
                {/* Personalized Targeting Insight */}
                {(isGeneratingInsight || targetInsight) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 glass-card border-primary/30 rounded-[3rem] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Fingerprint className="h-32 w-32" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                      <div className="p-6 bg-primary/10 rounded-[2rem] border border-primary/20 cyber-glow shrink-0">
                        <Activity className="h-12 w-12 text-primary" />
                      </div>
                      <div className="space-y-3 flex-1">
                        <h4 className="text-xl font-black uppercase tracking-tighter text-primary">Nova's Targeting Analysis</h4>
                        {isGeneratingInsight ? (
                          <p className="text-sm text-muted-foreground animate-pulse font-medium">Analyzing your forensic footprint for patterns...</p>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-sm font-medium leading-relaxed italic text-white/90">
                              "{targetInsight?.insight}"
                            </p>
                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                               <p className="text-[10px] font-black text-primary uppercase mb-1">Guardian Recommendation</p>
                               <p className="text-xs font-bold text-white/80">{targetInsight?.safetyRecommendation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
                   <Card className="glass-card border-white/5 rounded-[3rem] p-8 overflow-hidden relative">
                      <div className="absolute inset-0 bg-primary/5 opacity-50 blur-3xl" />
                      <ScamMap />
                   </Card>

                   <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center glass-card rounded-[3rem] p-12 text-center border-white/5 relative overflow-hidden"
                  >
                    <Globe className="absolute h-96 w-96 text-primary/5 -right-20 -bottom-20 rotate-12" />
                    <div className="relative mb-8">
                      <ShieldAlert className="h-24 w-24 text-white/5" />
                      <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 flex items-center justify-center">
                        <Fingerprint className="h-12 w-12 text-primary" />
                      </motion.div>
                    </div>
                    <h3 className="text-2xl font-bold uppercase tracking-tight">Nova is Listening</h3>
                    <p className="text-muted-foreground max-w-sm mt-2 text-sm font-medium">
                      Upload forensic evidence above to initiate the Nova Guardian Protocol.
                    </p>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <Card className="glass-card border-white/5 rounded-[2.5rem] p-8">
                      <h4 className="text-lg font-black uppercase tracking-tighter mb-4 text-primary">Cyber Safety Coach</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        "Welcome back. Remember: Scammers love creating urgency. If a message asks you to act in under 5 minutes, it's 99% a scam. Take a breath, and let Nova check it first."
                      </p>
                   </Card>
                   <Card className="glass-card border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="h-24 w-24 text-accent" /></div>
                      <h4 className="text-lg font-black uppercase tracking-tighter mb-4 text-accent">Active Defense Protocol</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Real-time Phishing Detection Active</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Regional Geo-Triage Shield Enabled</span>
                        </div>
                      </div>
                   </Card>
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
