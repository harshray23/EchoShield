
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, ShieldAlert, Heart, Share2, Skull, Play, Download, FileText,
  Fingerprint, Search, Activity, Eye, Users, MessageSquare, Wallet, PhoneCall, ShieldX, Brain, Sparkles, AlertCircle
} from 'lucide-react';
import { RiskMeter } from './RiskMeter';
import { type AnalyzeScamOutput } from '@/ai/flows/analyze-scam-flow';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

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

  const generatePDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    const caseNum = caseId?.toUpperCase() || 'TEMP-ID';

    doc.setFillColor(5, 6, 15);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(0, 183, 255);
    doc.setFontSize(22);
    doc.text('ECHOSHIELD NOVA REPORT', 20, 25);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`CASE ID: ${caseNum} | STAMP: ${timestamp}`, 20, 32);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(`VERDICT: ${result.trustLabel}`, 20, 55);
    doc.text(`THREAT TYPE: ${result.scamType}`, 20, 65);

    doc.setFontSize(12);
    doc.text('Forensic Summary:', 20, 85);
    const splitSummary = doc.splitTextToSize(result.summary, 170);
    doc.text(splitSummary, 20, 95);

    doc.text('Recommendations:', 20, 130);
    (doc as any).autoTable({
      startY: 135,
      head: [['Step', 'Action']],
      body: result.recommendations.map((r, i) => [i + 1, r]),
      theme: 'grid',
    });

    doc.save(`EchoShield-Case-${caseNum.substring(0, 8)}.pdf`);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-10 pb-24 ${showGrandmaMode ? 'max-w-4xl mx-auto' : ''}`}
    >
      {/* CASE FILE HEADER */}
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
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-[0.4em] uppercase text-primary animate-pulse"
                >
                  CALCULATING HEAT...
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Forensic Intelligence Panels */}
      <AnimatePresence>
        {!showGrandmaMode && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-10"
          >
            {/* SCAM DNA CARD */}
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-white/5 rounded-[3rem] p-10 space-y-10 relative overflow-hidden group h-full">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                  <Fingerprint className="h-56 w-56 text-primary" />
                </div>
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-primary relative z-10">
                  <Fingerprint className="h-6 w-6" /> SCAM DNA FINGERPRINT
                </div>
                <div className="space-y-8 relative z-10">
                  {Object.entries(result.scamDNA).map(([key, val], i) => (
                    <motion.div 
                      key={key} 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="space-y-3"
                    >
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                        <span className="text-muted-foreground">{key}</span>
                        <span className={val > 75 ? 'text-destructive font-bold' : 'text-primary'}>{val}%</span>
                      </div>
                      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-[2px]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${val}%` }}
                          transition={{ duration: 2, ease: "circOut" }}
                          className={`h-full ${val > 80 ? 'bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.5)]' : val > 50 ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-primary shadow-[0_0_15px_rgba(0,183,255,0.5)]'} rounded-full`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2rem] relative z-10 mt-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-4 w-4 text-primary" />
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Targeting Logic</p>
                  </div>
                  <p className="text-xs font-medium leading-relaxed text-white/80 italic">"{result.targetReason}"</p>
                </div>
              </Card>
            </motion.div>

            {/* EMOTIONAL MANIPULATION METER */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="glass-card border-primary/20 rounded-[3rem] p-10 space-y-10 h-full relative overflow-hidden">
                <div className="scanline opacity-30" />
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-4 bg-primary/10 rounded-[1.5rem] border border-primary/20 text-primary shadow-xl"><Activity className="h-8 w-8" /></div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Manipulation Decoder</h3>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-accent" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gemini Neural Forensic Insight</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                  <div className="space-y-8">
                    {[
                      { label: '😨 Fear Tactics', value: result.emotionalTriggers.fear, color: 'bg-red-500' },
                      { label: '😰 Anxiety Pressure', value: result.emotionalTriggers.anxiety, color: 'bg-orange-500' },
                      { label: '💰 Greed Hook', value: result.emotionalTriggers.greed, color: 'bg-yellow-500' },
                      { label: '❤️ Sympathy Lure', value: result.emotionalTriggers.sympathy, color: 'bg-accent' },
                      { label: '🏛️ Trust Abuse', value: result.emotionalTriggers.trustAbuse, color: 'bg-primary' },
                    ].map((trigger, i) => (
                      <motion.div 
                        key={trigger.label} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        className="space-y-3"
                      >
                        <div className="flex justify-between text-[12px] font-black uppercase tracking-tighter">
                          <span className="text-white/80">{trigger.label}</span>
                          <span className="text-white">{trigger.value}%</span>
                        </div>
                        <div className="h-4 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${trigger.value}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full ${trigger.color} rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)]`}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-6 h-full flex flex-col justify-center shadow-inner relative overflow-hidden group">
                      <div className="absolute -right-8 -bottom-8 opacity-5 rotate-12 transition-transform group-hover:rotate-0 duration-700">
                        <Search className="h-48 w-48 text-primary" />
                      </div>
                      <div className="flex items-center gap-3 text-primary relative z-10">
                        <AlertCircle className="h-6 w-6" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Neural Evidence Panel</span>
                      </div>
                      <div className="space-y-6 relative z-10">
                        {result.aiDetectiveInsights.slice(0, 3).map((insight, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 + i * 0.2 }}
                            className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-primary/30 transition-all cursor-default"
                          >
                            <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0 shadow-[0_0_10px_rgba(0,183,255,1)]" />
                            <p className="text-[13px] font-medium leading-relaxed text-white/90 italic">"{insight}"</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-center gap-8 pt-6"
      >
        <Button onClick={generatePDF} size="lg" className="h-18 px-14 rounded-[2.5rem] btn-gradient cyber-glow text-xl font-black uppercase tracking-tighter hover:scale-105 transition-transform">
          <Download className="mr-4 h-7 w-7" /> EXPORT FORENSIC FILE
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="h-18 px-12 rounded-[2.5rem] border-white/10 font-black text-lg hover:bg-white/5 transition-colors">
          <FileText className="mr-4 h-7 w-7" /> PRINT LOCAL ARCHIVE
        </Button>
      </motion.div>

      <Dialog open={showSim} onOpenChange={setShowSim}>
        <DialogContent className="max-w-3xl glass-card rounded-[3.5rem] p-0 border-white/5 overflow-hidden z-[101]">
          <DialogHeader className="sr-only">
            <DialogTitle>Nova Security Training Simulation</DialogTitle>
            <DialogDescription>Interactive forensic simulator for identify digital threats.</DialogDescription>
          </DialogHeader>
          <ScamSimulator scenario={result.simulationScenario || result.scamType} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
