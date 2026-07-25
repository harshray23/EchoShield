'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, FileText, Brain, AlertTriangle, CheckCircle, Loader2, Sparkles, Database, Fingerprint, Cpu, Zap } from 'lucide-react';

const STAGES = [
  { id: 'reading', label: 'Initializing Link...', icon: Cpu, color: 'text-primary' },
  { id: 'extracting', label: 'X-Ray Text Extraction...', icon: Search, color: 'text-primary' },
  { id: 'analyzing', label: 'Neural Linguistic Scan...', icon: Brain, color: 'text-primary' },
  { id: 'database', label: 'Phishing Pattern Cross-Check...', icon: Database, color: 'text-primary' },
  { id: 'detecting', label: 'Urgency Pressure Detection...', icon: Zap, color: 'text-orange-500' },
  { id: 'psychology', label: 'Manipulation DNA Mapping...', icon: Fingerprint, color: 'text-orange-500' },
  { id: 'recommending', label: 'Assembling Guardian Report...', icon: Shield, color: 'text-accent' },
  { id: 'complete', label: 'Finalizing Forensic Output', icon: CheckCircle, color: 'text-accent' },
];

export function AnalysisLoader() {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="h-[650px] flex flex-col items-center justify-center glass-card rounded-[3rem] p-12 text-center border-primary/20 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,183,255,0.05)_0%,transparent_70%)]" />
      <div className="scanline" />
      
      <div className="relative z-10 space-y-16 w-full max-w-lg">
        <div className="flex justify-center">
          <div className="relative">
            {/* Pulsing Neural Rings */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} 
              transition={{ duration: 3, repeat: Infinity }} 
              className="absolute -inset-20 border border-primary/30 rounded-full" 
            />
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }} 
              className="absolute -inset-12 border border-dashed border-primary/20 rounded-full" 
            />
            
            <div className="p-12 rounded-[3.5rem] bg-black/40 backdrop-blur-xl border border-primary/30 cyber-glow relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={STAGES[currentStageIndex].id}
                  initial={{ scale: 0.5, opacity: 0, rotateY: 180, filter: 'blur(10px)' }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0, filter: 'blur(0px)' }}
                  exit={{ scale: 1.5, opacity: 0, rotateY: -180, filter: 'blur(10px)' }}
                  transition={{ type: 'spring', damping: 15 }}
                  className={STAGES[currentStageIndex].color}
                >
                  {(() => {
                    const Icon = STAGES[currentStageIndex].icon;
                    return <Icon className="h-24 w-24 drop-shadow-[0_0_15px_rgba(0,183,255,0.5)]" />;
                  })()}
                </motion.div>
              </AnimatePresence>
              <div className="absolute -top-4 -right-4">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Sparkles className="h-8 w-8 text-primary" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              <motion.h3 
                key={STAGES[currentStageIndex].id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-2xl font-black uppercase tracking-tighter text-white"
              >
                {STAGES[currentStageIndex].label}
              </motion.h3>
            </AnimatePresence>
            
            <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto">
              {STAGES.slice(Math.max(0, currentStageIndex - 1), currentStageIndex + 2).map((stage, index) => {
                const stageIdx = STAGES.findIndex(s => s.id === stage.id);
                const isActive = stageIdx === currentStageIndex;
                const isCompleted = stageIdx < currentStageIndex;

                return (
                  <motion.div 
                    key={stage.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isActive ? 1 : 0.3, x: 0 }}
                    className="flex items-center gap-4"
                  >
                    <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-primary animate-ping' : isCompleted ? 'bg-accent' : 'bg-white/10'}`} />
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {stage.label}
                    </span>
                    {isCompleted && <CheckCircle className="h-3 w-3 text-accent ml-auto" />}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-primary/70 animate-pulse">
                Neural Link Signal Strength: 98%
              </p>
              <span className="text-[10px] font-black text-primary">{Math.round(((currentStageIndex + 1) / STAGES.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[2px]">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-cyan-400 to-accent shadow-[0_0_20px_rgba(0,183,255,0.6)] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStageIndex + 1) / STAGES.length) * 100}%` }}
                transition={{ duration: 0.8, ease: "circOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
