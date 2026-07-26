'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, Share2, Skull, Play, FileText
} from 'lucide-react';
import { RiskMeter } from './RiskMeter';
import { type AnalyzeScamOutput } from '@/ai/flows/analyze-scam-flow';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScamSimulator } from './ScamSimulator';

interface AnalysisDetailsProps {
  result: AnalyzeScamOutput;
  audioUrl: string | null;
  caseId: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.98 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', damping: 20, stiffness: 100 }
  }
};

export function AnalysisDetails({ result, audioUrl, caseId }: AnalysisDetailsProps) {
  const [showGrandmaMode, setShowGrandmaMode] = useState(false);
  const [showSim, setShowSim] = useState(false);
  const [isDecoding, setIsDecoding] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsDecoding(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const trustColors: Record<string, string> = {
    'Trusted': 'text-accent bg-accent/10 border-accent/20',
    'Suspicious': 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    'Dangerous': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    'Highly Dangerous': 'text-destructive bg-destructive/10 border-destructive/20 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    'NUCLEAR ☠️': 'text-white bg-red-600 border-red-800 animate-pulse shadow-[0_0_40px_rgba(255,0,0,0.6)]',
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-10 pb-24 ${showGrandmaMode ? 'max-w-4xl mx-auto' : ''}`}
    >
      <motion.div variants={itemVariants}>
        <Card className={`glass-card border-white/5 overflow-hidden rounded-[3rem] shadow-2xl ${result.riskLevel === 'nuclear' ? 'border-red-600/50 shadow-red-900/20' : ''}`}>
          <div className="scanline" />
          <div className={`h-3 w-full ${result.riskLevel === 'nuclear' ? 'bg-red-600 animate-pulse' : result.riskLevel === 'malicious' ? 'bg-destructive' : result.riskLevel === 'suspicious' ? 'bg-orange-500' : 'bg-accent'}`} />
          <CardContent className="p-10 sm:p-14">
            <div className="flex flex-col xl:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <Badge className={`rounded-full px-5 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] ${trustColors[result.trustLabel]}`}>
                      {result.trustLabel}
                    </Badge>
                    {result.riskLevel === 'nuclear' && <Skull className="h-6 w-6 text-red-600 animate-bounce" />}
                    <div className="h-4 w-px bg-white/10 hidden sm:block" />
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" /> CASE ID: {caseId?.substring(0, 10) || 'GEN-01'}
                    </span>
                  </div>
                  <h2 className={`${showGrandmaMode ? 'text-6xl' : 'text-5xl sm:text-6xl'} font-black tracking-tighter uppercase leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60`}>
                    {result.scamCategory}
                  </h2>
                  <p className={`${showGrandmaMode ? 'text-2xl leading-relaxed' : 'text-lg leading-relaxed'} text-muted-foreground/80 italic font-medium max-w-2xl`}>
                    {showGrandmaMode ? result.grandmaExplanation : result.summary}
                  </p>
                </div>

                <div className="flex flex-wrap gap-5">
                  <Button 
                    onClick={() => setShowGrandmaMode(!showGrandmaMode)} 
                    className={`rounded-[1.5rem] h-16 px-10 font-black transition-all text-base ${showGrandmaMode ? 'bg-accent text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'}`}
                  >
                    <Heart className="mr-3 h-6 w-6" /> {showGrandmaMode ? 'EXIT GRANDMA MODE' : 'EXPLAIN SIMPLY'}
                  </Button>
                  <Button onClick={() => setShowSim(true)} className="rounded-[1.5rem] h-16 px-10 font-black text-base btn-gradient cyber-glow">
                    <Play className="mr-3 h-6 w-6" /> EXPERIENCE SAFELY
                  </Button>
                  <Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`🚨 EchoShield AI detected a threat: ${result.scamType}. Check it out!`)}`, '_blank')} variant="outline" className="rounded-[1.5rem] h-16 px-8 border-white/10 hover:bg-white/5 transition-colors">
                    <Share2 className="mr-3 h-6 w-6" /> SHARE ALERT
                  </Button>
                </div>
              </div>
              <div className="shrink-0 relative">
                <RiskMeter score={result.riskScore} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showSim} onOpenChange={setShowSim}>
        <DialogContent className="max-w-3xl glass-card rounded-[3.5rem] p-0 border-white/5 overflow-hidden z-[101]">
          <DialogHeader className="p-8 bg-white/5 border-b border-white/5">
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Nova Security Training Simulation</DialogTitle>
            <DialogDescription className="text-[10px] font-black tracking-widest uppercase">Safe Forensic Training Environment</DialogDescription>
          </DialogHeader>
          <ScamSimulator scenario={result.simulationScenario || result.scamType} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
