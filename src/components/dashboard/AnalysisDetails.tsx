'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, CheckCircle2, Volume2, Download, ShieldAlert, Zap, Info, MessageSquare, 
  ExternalLink, Key, Wallet, BrainCircuit, ShieldCheck, CheckCircle, FileSearch, FileText,
  Heart, Users, Share2, ShieldX, PhoneCall, Copy, Ghost, Sparkles, Search, Languages,
  Fingerprint, Skull, ArrowRight, Activity, Eye, Shield
} from 'lucide-react';
import { RiskMeter } from './RiskMeter';
import { type AnalyzeScamOutput } from '@/ai/flows/analyze-scam-flow';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';

interface AnalysisDetailsProps {
  result: AnalyzeScamOutput;
  audioUrl: string | null;
  caseId: string | null;
}

export function AnalysisDetails({ result, audioUrl, caseId }: AnalysisDetailsProps) {
  const [showGrandmaMode, setShowGrandmaMode] = useState(false);
  const { toast } = useToast();

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`space-y-8 pb-24 ${showGrandmaMode ? 'max-w-4xl mx-auto' : ''}`}>
      
      {/* CASE FILE HEADER */}
      <Card className={`glass-card border-white/5 overflow-hidden rounded-[2.5rem] relative ${result.riskLevel === 'nuclear' ? 'border-red-600/50' : ''}`}>
        <div className={`h-2 w-full ${result.riskLevel === 'nuclear' ? 'bg-red-600 animate-pulse' : result.riskLevel === 'malicious' ? 'bg-destructive' : 'bg-accent'}`} />
        <CardContent className="p-8 sm:p-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge className={`rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${trustColors[result.trustLabel]}`}>
                    {result.trustLabel}
                  </Badge>
                  {result.riskLevel === 'nuclear' && <Skull className="h-5 w-5 text-red-600 animate-bounce" />}
                  <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Case ID: {caseId?.substring(0, 8) || 'Scanning...'}</span>
                </div>
                <h2 className={`${showGrandmaMode ? 'text-6xl' : 'text-4xl sm:text-5xl'} font-black tracking-tighter uppercase leading-tight`}>
                  {result.scamCategory}
                </h2>
                <p className={`${showGrandmaMode ? 'text-xl' : 'text-base'} text-muted-foreground italic font-medium leading-relaxed max-w-xl`}>
                  {showGrandmaMode ? result.grandmaExplanation : result.summary}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => setShowGrandmaMode(!showGrandmaMode)} 
                  className={`rounded-2xl h-14 px-8 font-black transition-all ${showGrandmaMode ? 'bg-accent text-white' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}
                >
                  <Heart className="mr-2 h-5 w-5" /> {showGrandmaMode ? 'Exit Grandma Mode' : 'Explain Simply'}
                </Button>
                <Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`🚨 EchoShield AI detected a threat: ${result.scamType}. Check it out!`)}`, '_blank')} variant="outline" className="rounded-2xl border-white/10 h-14 px-6">
                  <Share2 className="mr-2 h-5 w-5" /> Share Security Alert
                </Button>
              </div>
            </div>
            <div className="shrink-0 scale-110">
              <RiskMeter score={result.riskScore} />
            </div>
          </div>
        </CardContent>
      </Card>

      {!showGrandmaMode && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SCAM DNA CARD */}
          <Card className="glass-card border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
              <Fingerprint className="h-5 w-5" /> SCAM DNA ANALYSIS
            </div>
            <div className="space-y-4">
              {Object.entries(result.scamDNA).map(([key, val]) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                    <span className="text-muted-foreground">{key}</span>
                    <span className={val > 70 ? 'text-destructive' : 'text-primary'}>{val}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      className={`h-full ${val > 70 ? 'bg-destructive' : 'bg-primary'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
              <p className="text-[10px] font-black text-primary uppercase mb-1">Targeting Logic</p>
              <p className="text-xs font-medium leading-relaxed text-white/80">{result.targetReason}</p>
            </div>
          </Card>

          {/* AI DETECTIVE CASE FILE */}
          <Card className="glass-card border-primary/20 rounded-[2.5rem] lg:col-span-2 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Search className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Forensic Case File</h3>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">AI Detective Observations</p>
                </div>
              </div>
              <Badge variant="outline" className="rounded-full border-primary/30 text-primary">CONFIDENCE: {(result.confidence * 100).toFixed(0)}%</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.aiDetectiveInsights.map((insight, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
                  <div className="p-2 h-fit bg-primary/10 rounded-lg text-primary"><Activity className="h-4 w-4" /></div>
                  <p className="text-xs font-medium leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ATTACK PATH VISUALIZATION */}
      {!showGrandmaMode && (
        <Card className="glass-card border-white/5 rounded-[2.5rem] p-8">
          <div className="flex items-center gap-3 mb-8">
             <div className="p-3 bg-accent/10 rounded-2xl text-accent"><Activity className="h-6 w-6" /></div>
             <h3 className="text-2xl font-black uppercase tracking-tighter">Attack Progression Path</h3>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 hidden md:block -z-10" />
            {result.timeline.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3 flex-1">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all shadow-xl ${step.status === 'completed' ? 'bg-accent border-accent text-white' : step.status === 'active' ? 'bg-primary border-primary animate-pulse text-white' : 'bg-card border-white/10 text-muted-foreground'}`}>
                  {i + 1}
                </div>
                <div className="space-y-1 px-4">
                  <p className={`text-xs font-black uppercase tracking-tight ${step.status === 'completed' ? 'text-accent' : step.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`}>{step.label}</p>
                  <p className="text-[10px] text-muted-foreground font-medium leading-tight line-clamp-2">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI X-RAY HIGHLIGHTS */}
      {!showGrandmaMode && (
        <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="bg-white/5 p-8 border-b border-white/5 flex items-center gap-3">
             <Eye className="h-6 w-6 text-primary" />
             <h3 className="text-xl font-black uppercase tracking-tighter">AI X-Ray Detection</h3>
          </div>
          <div className="p-8 space-y-6">
            {result.highlights.map((h, i) => (
              <div key={i} className={`p-5 rounded-3xl border ${h.type === 'danger' ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5 border-primary/20'} flex flex-col md:flex-row gap-6 items-center`}>
                <div className="flex-1 space-y-2">
                   <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Snippet Spotted</p>
                   <p className={`text-lg font-bold ${h.type === 'danger' ? 'text-destructive' : 'text-primary'}`}>"{h.text}"</p>
                </div>
                <div className="h-px w-full md:w-px md:h-12 bg-white/10" />
                <div className="flex-1">
                   <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Forensic Why</p>
                   <p className="text-sm font-medium leading-relaxed text-white/80">{h.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* NUCLEAR PROTOCOL */}
      {result.riskLevel === 'nuclear' && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-10 bg-red-600/10 border-2 border-red-600 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-10 shadow-[0_0_60px_rgba(255,0,0,0.3)]">
          <div className="space-y-3 text-center md:text-left">
            <h3 className="text-4xl font-black text-red-600 uppercase tracking-tighter">🚨 NUCLEAR THREAT DETECTED</h3>
            <p className="text-lg font-medium text-white/90 max-w-lg">Nova identified a severe active attack. Execution of digital defense protocols is MANDATORY.</p>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <Button className="h-16 px-10 rounded-[1.5rem] bg-red-600 text-white font-black hover:bg-red-700 gap-3 text-lg shadow-2xl">
              <ShieldX className="h-6 w-6" /> Block & Report Now
            </Button>
            <Button variant="outline" className="h-14 px-10 rounded-[1.5rem] border-white/20 text-white font-black hover:bg-white/5">
              <PhoneCall className="mr-2 h-5 w-5" /> Emergency Family Call
            </Button>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-6">
        <Button onClick={generatePDF} size="lg" className="h-16 px-12 rounded-[2rem] btn-gradient cyber-glow text-lg font-black uppercase tracking-tighter">
          <Download className="mr-2 h-6 w-6" /> Export Forensic Case File
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="h-16 px-12 rounded-[2rem] border-white/10 font-black">
          <FileText className="mr-2 h-6 w-6" /> Local Archive Print
        </Button>
      </div>

      <p className="text-center text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.6em] pb-10">
        "Scammers are already using AI. It's time people had AI on their side too."
      </p>
    </motion.div>
  );
}
