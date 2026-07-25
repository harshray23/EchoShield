'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, FileText, Brain, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const STAGES = [
  { id: 'reading', label: 'Reading File', icon: FileText, color: 'text-primary' },
  { id: 'extracting', label: 'Extracting Text', icon: Search, color: 'text-primary' },
  { id: 'analyzing', label: 'Analyzing Content', icon: Brain, color: 'text-primary' },
  { id: 'detecting', label: 'Detecting Scam', icon: AlertTriangle, color: 'text-orange-500' },
  { id: 'recommending', label: 'Generating Recommendations', icon: Shield, color: 'text-accent' },
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
    }, 1500); // Progress through stages every 1.5s

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-[500px] flex flex-col items-center justify-center glass-card rounded-[2rem] p-12 text-center border-primary/20 relative overflow-hidden"
    >
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-primary/5 animate-pulse" />
      
      {/* Scanning Effect */}
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 z-20"
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 space-y-12 w-full max-w-md">
        {/* Main Icon Animation */}
        <div className="flex justify-center">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 border border-dashed border-primary/30 rounded-full"
            />
            <div className="p-8 rounded-[2.5rem] bg-primary/10 border border-primary/20 cyber-glow relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={STAGES[currentStageIndex].id}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className={STAGES[currentStageIndex].color}
                >
                  {(() => {
                    const Icon = STAGES[currentStageIndex].icon;
                    return <Icon className="h-16 w-16" />;
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stage List */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            {STAGES.map((stage, index) => {
              const isActive = index === currentStageIndex;
              const isCompleted = index < currentStageIndex;
              
              return (
                <div key={stage.id} className="flex items-center gap-4 transition-all">
                  <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-primary animate-ping' : isCompleted ? 'bg-accent' : 'bg-white/10'}`} />
                  <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-primary' : isCompleted ? 'text-accent/70' : 'text-muted-foreground'}`}>
                    {stage.label}
                  </span>
                  {isActive && <Loader2 className="h-3 w-3 animate-spin text-primary ml-auto" />}
                  {isCompleted && <CheckCircle className="h-3 w-3 text-accent ml-auto" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Text */}
        <div className="space-y-2">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground animate-pulse">
            Deep Scan in Progress... System Forensic Link Stable
          </p>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
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
