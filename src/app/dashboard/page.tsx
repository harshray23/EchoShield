'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ShieldAlert } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { AnalysisService } from '@/services/analysis-service';
import { TriageCenter } from '@/components/dashboard/TriageCenter';
import { AnalysisDetails } from '@/components/dashboard/AnalysisDetails';
import { AnalysisLoader } from '@/components/dashboard/AnalysisLoader';
import { type AnalyzeScamOutput } from '@/ai/flows/analyze-scam-flow';

export default function DashboardPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeScamOutput | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const handleAnalyze = async (type: 'text' | 'image' | 'voice' | 'document', content: string) => {
    if (!user) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setAudioUrl(null);

    try {
      const service = new AnalysisService(db, user.uid);
      const { analysis, warningAudio } = await service.performAnalysis({ type, content });
      
      // Delay just a bit to let the animation finish its stages
      setTimeout(() => {
        setResult(analysis);
        if (warningAudio) setAudioUrl(warningAudio);
        setIsAnalyzing(false);

        toast({
          title: 'Analysis Complete',
          description: `Threat level identified as ${analysis.riskScore}% risk.`,
        });
      }, 1000);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Intelligence network connection timed out.',
      });
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <Fingerprint className="h-10 w-10 text-primary" />
          Security Console
        </h1>
        <p className="text-muted-foreground font-medium">Real-time threat detection and behavioral analysis.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <TriageCenter onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

        <div className="xl:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <AnalysisLoader key="loader" />
            ) : !result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[500px] flex flex-col items-center justify-center glass-card rounded-[2rem] p-12 text-center border-white/5"
              >
                <div className="relative mb-8">
                  <ShieldAlert className="h-24 w-24 text-white/5" />
                  <motion.div 
                    animate={{ opacity: [0.2, 0.5, 0.2] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Fingerprint className="h-12 w-12 text-primary" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold">Awaiting Behavioral Data</h3>
                <p className="text-muted-foreground max-w-sm mt-2">Upload suspicious media to initiate forensic triage.</p>
              </motion.div>
            ) : (
              <AnalysisDetails key="result" result={result} audioUrl={audioUrl} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
