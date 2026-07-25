'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  Download, 
  ShieldAlert, 
  Zap, 
  Info,
  MessageSquare,
  ExternalLink,
  Key,
  Wallet,
  BrainCircuit,
  ShieldCheck
} from 'lucide-react';
import { RiskMeter } from './RiskMeter';
import { type AnalyzeScamOutput } from '@/ai/flows/analyze-scam-flow';

interface AnalysisDetailsProps {
  result: AnalyzeScamOutput;
  audioUrl: string | null;
}

export function AnalysisDetails({ result, audioUrl }: AnalysisDetailsProps) {
  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const downloadReport = () => {
    const content = JSON.stringify(result, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `echoshield-report-${result.scamType.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getRiskColor = (score: number) => {
    if (score <= 40) return 'text-accent';
    if (score <= 60) return 'text-yellow-500';
    if (score <= 80) return 'text-orange-500';
    return 'text-destructive';
  };

  const statusColor = getRiskColor(result.riskScore);

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="h-5 w-5" />;
      case 'link': return <ExternalLink className="h-5 w-5" />;
      case 'otp': return <Key className="h-5 w-5" />;
      case 'money': return <Wallet className="h-5 w-5" />;
      case 'risk': return <ShieldAlert className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      {/* Risk Level Header Card */}
      <Card className="glass-card border-white/5 overflow-hidden rounded-[2.5rem] relative shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent opacity-50" />
        <CardContent className="p-8 sm:p-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 text-center lg:text-left flex-1">
              <div className="space-y-2">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                   <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                   <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-black">Threat Analysis Protocol</p>
                </div>
                <h2 className={`text-5xl sm:text-6xl font-black tracking-tighter uppercase leading-tight ${statusColor}`}>
                  {result.scamType}
                </h2>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-4">
                  <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Confidence: {(result.confidence * 100).toFixed(0)}%
                  </span>
                  <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-primary" /> Forensic Link Verified
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-xl text-sm font-medium italic">
                {result.summary}
              </p>
            </div>
            <div className="relative group shrink-0">
               <RiskMeter score={result.riskScore} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Psychology Panel ⭐ - The Star Feature */}
      <Card className="glass-card border-primary/20 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-primary">
                <BrainCircuit className="h-7 w-7" />
                Psychology Panel
              </CardTitle>
              <CardDescription className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
                Detected Manipulation Tactics
              </CardDescription>
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] font-black bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20 uppercase tracking-widest">
                AI Behavior Analysis
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 sm:p-10 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              'Urgency', 'Authority', 'Fear', 'Greed', 'Scarcity', 
              'Curiosity', 'Emotional Appeal', 'Isolation', 'Reward Promise'
            ].map((tactic) => {
              const isActive = result.manipulationTactics.includes(tactic as any);
              return (
                <motion.div
                  key={tactic}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-2 ${
                    isActive 
                    ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_20px_rgba(0,183,255,0.2)]' 
                    : 'bg-white/5 border-white/5 text-muted-foreground opacity-40 grayscale'
                  }`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-transparent'}`} />
                  <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{tactic}</span>
                  {isActive && <div className="absolute top-2 right-2"><ShieldAlert className="h-3 w-3" /></div>}
                </motion.div>
              );
            })}
          </div>
          <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-3xl">
            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
              <Info className="h-3 w-3" /> Forensic Psychologist Note
            </h4>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              {result.psychology}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Visual Storytelling Timeline */}
      <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary" />
            Threat Lifecycle
          </CardTitle>
          <CardDescription className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
            Chronological Scam Progression
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 sm:p-10">
          <div className="relative space-y-8">
            {result.timeline.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-start gap-6 relative"
              >
                {index !== result.timeline.length - 1 && (
                  <div className="absolute left-[26px] top-12 bottom-[-32px] w-px bg-gradient-to-b from-primary/50 to-transparent" />
                )}
                
                <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center relative z-10 border transition-all ${
                  step.status === 'completed' ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(0,183,255,0.1)]' : 
                  step.status === 'active' ? 'bg-accent/20 border-accent/40 text-accent animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 
                  'bg-white/5 border-white/10 text-muted-foreground'
                }`}>
                  {getTimelineIcon(step.iconType)}
                </div>

                <div className="space-y-1 pt-1">
                  <h4 className={`text-lg font-black uppercase tracking-tight ${
                    step.status === 'active' ? 'text-accent' : 
                    step.status === 'completed' ? 'text-white' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </h4>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-lg">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Identified Red Flags Card */}
        <Card className="glass-card border-white/5 rounded-[2rem] hover:border-destructive/20 transition-colors">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center text-xl font-black gap-3 text-destructive uppercase tracking-tighter">
              <AlertTriangle className="h-6 w-6" /> 
              Behavioral Red Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="space-y-3">
              {result.redFlags.map((flag, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group hover:bg-white/10 transition-colors"
                >
                  <div className="h-2 w-2 rounded-full bg-destructive shadow-[0_0_12px_rgba(239,68,68,1)] flex-shrink-0" />
                  <span className="text-[11px] font-black tracking-widest text-white/80 uppercase">{flag}</span>
                </motion.div>
              ))}
            </div>
            {audioUrl && (
              <Button 
                className="mt-6 w-full h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center gap-3 text-primary hover:bg-primary/10 transition-all group shadow-lg"
                onClick={playAudio}
              >
                <Volume2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="font-black text-xs uppercase tracking-[0.2em]">Play Audio Warning</span>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Action Protocol Card */}
        <Card className="glass-card border-accent/20 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center text-xl font-black gap-3 text-accent uppercase tracking-tighter">
              <CheckCircle2 className="h-6 w-6" /> 
              Emergency Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            {result.recommendations.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
                <span className="text-[11px] font-black text-white/90 uppercase tracking-tighter">{item}</span>
              </div>
            ))}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="outline" className="flex-1 h-12 rounded-xl border-white/10 font-black uppercase text-[10px] tracking-widest gap-2" onClick={downloadReport}>
                <Download className="h-4 w-4" /> Download
              </Button>
              <Button className="flex-1 h-12 rounded-xl btn-gradient font-black uppercase text-[10px] tracking-widest">
                Store Evidence
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
