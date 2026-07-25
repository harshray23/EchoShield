'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, FileText, Brain, AlertTriangle, CheckCircle, Loader2, Sparkles, Database, Fingerprint } from 'lucide-react';

const STAGES = [
  { id: 'reading', label: 'Reading Evidence...', icon: FileText, color: 'text-primary' },
  { id: 'extracting', label: 'Finding Hidden Text...', icon: Search, color: 'text-primary' },
  { id: 'analyzing', label: 'Analyzing Content...', icon: Brain, color: 'text-primary' },
  { id: 'database', label: 'Checking Phishing Database...', icon: Database, color: 'text-primary' },
  { id: 'detecting', label: 'Looking for Urgency...', icon: AlertTriangle, color: 'text-orange-500' },
  { id: 'psychology', label: 'Analyzing Psychology...', icon: Fingerprint, color: 'text-orange-500' },
  { id: 'recommending', label: 'Preparing Report...', icon: Shield, color: 'text-accent' },
  { id: 'complete', label: 'Complete', icon: CheckCircle, color: 'text-accent' },
];

export function AnalysisLoader() {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-[600px] flex flex-col items-center justify-center glass-card rounded-[3rem] p-12 text-center border-primary/20 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-primary/5 animate-pulse" />
      
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 z-20"
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 space-y-12 w-full max-w-md">
        <div className="flex justify-center">
          <div className="relative">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -inset-12 border border-dashed border-primary/20 rounded-full" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -inset-16 border border-dashed border-accent/10 rounded-full" />
            
            <div className="p-10 rounded-[3rem] bg-primary/10 border border-primary/20 cyber-glow relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={STAGES[currentStageIndex].id}
                  initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  exit={{ scale: 1.5, opacity: 0, rotateY: -180 }}
                  className={STAGES[currentStageIndex].color}
                >
                  {(() => {
                    const Icon = STAGES[currentStageIndex].icon;
                    return <Icon className="h-20 w-20" />;
                  })()}
                </motion.div>
              </AnimatePresence>
              <div className="absolute -top-2 -right-2"><Sparkles className="h-6 w-6 text-primary animate-pulse" /></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3">
            {STAGES.map((stage, index) => {
              const isActive = index === currentStageIndex;
              const isCompleted = index < currentStageIndex;
              
              if (index > currentStageIndex + 1 && index < STAGES.length - 1) return null;

              return (
                <motion.div 
                  key={stage.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isActive || isCompleted ? 1 : 0.2, x: 0 }}
                  className="flex items-center gap-4 transition-all"
                >
                  <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-primary animate-ping' : isCompleted ? 'bg-accent' : 'bg-white/10'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isActive ? 'text-primary' : isCompleted ? 'text-accent/70' : 'text-muted-foreground'}`}>
                    {stage.label}
                  </span>
                  {isActive && <Loader2 className="h-3 w-3 animate-spin text-primary ml-auto" />}
                  {isCompleted && <CheckCircle className="h-3 w-3 text-accent ml-auto" />}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black tracking-[0.5em] uppercase text-primary animate-pulse">
            Establishing Forensic Link...
          </p>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_15px_rgba(0,183,255,0.5)]"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStageIndex + 1) / STAGES.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
