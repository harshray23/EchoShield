'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, AlertTriangle, CheckCircle2, Volume2 } from 'lucide-react';
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      {/* Risk Level Header */}
      <Card className="glass-card border-primary/20 overflow-hidden rounded-[2rem]">
        <div className={`h-2 w-full ${result.score > 70 ? 'bg-destructive' : result.score > 40 ? 'bg-orange-500' : 'bg-accent'}`} />
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black mb-1">Threat Status</p>
                <h2 className={`text-6xl font-black tracking-tighter ${result.score > 70 ? 'text-destructive' : result.score > 40 ? 'text-orange-500' : 'text-accent'}`}>
                  {result.score > 70 ? 'MALICIOUS' : result.score > 40 ? 'SUSPICIOUS' : 'SECURE'}
                </h2>
              </div>
              <p className="text-xl font-bold opacity-90 leading-tight max-w-md">{result.verdict}</p>
            </div>
            <RiskMeter score={result.score} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* educational Breakdown */}
        <Card className="glass-card border-white/5 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-black"><BookOpen className="mr-3 h-6 w-6 text-primary" /> Forensic Analysis</CardTitle>
            <CardDescription>Understanding the deception tactics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground leading-relaxed font-medium">{result.explanation}</p>
            
            {audioUrl && (
              <Button 
                className="w-full h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-4 text-primary hover:bg-primary/20 transition-all"
                onClick={playAudio}
              >
                <Volume2 className="h-8 w-8" />
                <div className="text-left">
                  <p className="font-black tracking-tight">AI Warning Audio</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Synthesized Alert</p>
                </div>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Manipulation Vectors */}
        <Card className="glass-card border-white/5 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-black"><AlertTriangle className="mr-3 h-6 w-6 text-destructive" /> Manipulation Vectors</CardTitle>
            <CardDescription>Identified social engineering traits.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.redFlags.map((flag, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                  <span className="text-sm font-bold tracking-tight">{flag}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Checklist */}
        <Card className="md:col-span-2 glass-card border-accent/20 rounded-[2rem] overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-8 space-y-6">
              <CardTitle className="flex items-center text-2xl font-black"><CheckCircle2 className="mr-3 h-8 w-8 text-accent" /> Security Protocol</CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                    <CheckCircle2 className="h-5 w-5 text-accent" /> 
                    <span className="text-sm font-bold opacity-80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:w-1/3 bg-accent/10 p-8 flex flex-col justify-center border-l border-accent/10">
              <h4 className="font-black text-accent mb-4 tracking-[0.2em] uppercase text-xs">Strategic Advice</h4>
              <p className="text-sm leading-relaxed font-bold opacity-90">{result.advice}</p>
              <Button className="mt-8 rounded-xl bg-accent hover:bg-accent/90 text-white font-black">REPORT INCIDENT</Button>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
