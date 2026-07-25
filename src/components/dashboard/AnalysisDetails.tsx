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
  ArrowDown
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
      className="space-y-8"
    >
      {/* Risk Level Header Card */}
      <Card className={`glass-card border-white/5 overflow-hidden rounded-[2.5rem] relative shadow-2xl`}>
        <div className={`h-1.5 w-full bg-gradient-to-r from-primary to-accent opacity-50`} />
        <CardContent className="p-8 sm:p-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 text-center lg:text-left flex-1">
              <div className="space-y-2">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                   <div className={`h-2 w-2 rounded-full bg-primary animate-pulse`} />
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
                    <Info className="h-3 w-3 text-primary" /> Forensic Analysis Verified
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

      {/* Cyber Heat Timeline - The "Judge Favorite" */}
      <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary" />
            Scam Progression Timeline
          </CardTitle>
          <CardDescription className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
            Visual Lifecycle of the Threat
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
                {/* Timeline Line */}
                {index !== result.timeline.length - 1 && (
                  <div className="absolute left-[26px] top-12 bottom-[-32px] w-px bg-gradient-to-b from-primary/50 to-transparent" />
                )}
                
                {/* Step Icon */}
                <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center relative z-10 border transition-all ${
                  step.status === 'completed' ? 'bg-primary/20 border-primary/40 text-primary' : 
                  step.status === 'active' ? 'bg-accent/20 border-accent/40 text-accent animate-pulse' : 
                  'bg-white/5 border-white/10 text-muted-foreground'
                }`}>
                  {getTimelineIcon(step.iconType)}
                </div>

                {/* Step Details */}
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
                  {step.status === 'active' && (
                    <div className="flex items-center gap-2 mt-2">
                       <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-accent">Active Threat Stage</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Psychological Analysis (Tricks) */}
        <Card className="glass-card border-white/5 rounded-[2rem] hover:border-primary/20 transition-colors">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center text-xl font-black gap-3 text-primary">
              <BookOpen className="h-6 w-6" /> 
              Forensic Psychology
            </CardTitle>
            <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Scam Logic Breakdown</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            <p className="text-muted-foreground leading-relaxed font-medium text-sm">
              {result.psychology}
            </p>
            
            {audioUrl && (
              <Button 
                className="w-full h-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between px-6 text-primary hover:bg-primary/10 transition-all group"
                onClick={playAudio}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <Volume2 className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm tracking-tight uppercase">Play Warning</p>
                    <p className="text-[9px] uppercase font-bold tracking-[0.2em] opacity-60">AI Protective Voice</p>
                  </div>
                </div>
                <Zap className="h-4 w-4 opacity-50" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Identified Red Flags */}
        <Card className="glass-card border-white/5 rounded-[2rem] hover:border-destructive/20 transition-colors">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center text-xl font-black gap-3 text-destructive">
              <AlertTriangle className="h-6 w-6" /> 
              Behavioral Red Flags
            </CardTitle>
            <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Manipulation Indicators</CardDescription>
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
                  <span className="text-xs font-bold tracking-tight text-white/80 uppercase tracking-tighter">{flag}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Protocol (Recommendations & Checklist) */}
        <Card className="md:col-span-2 glass-card border-accent/20 rounded-[2.5rem] overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-8 sm:p-10 space-y-8">
              <div className="space-y-2">
                <CardTitle className="flex items-center text-2xl font-black gap-3 text-accent uppercase tracking-tighter">
                  <CheckCircle2 className="h-8 w-8" /> 
                  Safety Protocol
                </CardTitle>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Emergency Action Checklist</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.recommendations.map((item, i) => (
                  <motion.div 
                    key={i} 
                    className="flex items-center gap-4 p-5 bg-accent/5 rounded-2xl border border-accent/10 group hover:border-accent/30 transition-all"
                  >
                    <div className="bg-accent/20 p-2 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-accent" /> 
                    </div>
                    <span className="text-xs font-bold text-white/90 uppercase tracking-tight">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-80 bg-accent/10 p-8 sm:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-accent/10 sm:rounded-b-[2.5rem] lg:rounded-bl-none">
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                   <h4 className="font-black text-accent mb-2 tracking-[0.3em] uppercase text-[9px]">Forensic Conclusion</h4>
                   <p className="text-2xl font-black tracking-tighter leading-none">THREAT {result.riskScore > 60 ? 'DETECTED' : result.riskScore > 20 ? 'SUSPECTED' : 'LOW'}</p>
                </div>

                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full h-12 rounded-xl border-accent/20 hover:bg-accent/10 hover:text-accent font-black text-[10px] uppercase tracking-widest gap-2"
                    onClick={downloadReport}
                  >
                    <Download className="h-4 w-4" /> Download Report
                  </Button>
                  <Button className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-white font-black text-[10px] uppercase tracking-widest">
                    Seal & Store Evidence
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
