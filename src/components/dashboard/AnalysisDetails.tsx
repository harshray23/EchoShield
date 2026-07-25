'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, CheckCircle2, Volume2, Download, ShieldAlert, Zap, Info, MessageSquare, 
  ExternalLink, Key, Wallet, BrainCircuit, ShieldCheck, CheckCircle, FileSearch, FileText,
  Heart, Users, Share2, ShieldX, PhoneCall, Copy, Ghost, Sparkles, Search, Languages
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

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const handleShare = () => {
    const text = `🚨 EchoShield AI identified a ${result.trustLabel} message (${result.scamCategory}). Please stay safe! Check your messages at EchoShield AI.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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
    doc.text(`CASE ID: ${caseNum} | GENERATED: ${timestamp}`, 20, 32);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(`THREAT: ${result.scamType}`, 20, 55);
    doc.text(`CATEGORY: ${result.scamCategory}`, 20, 65);
    doc.text(`STATUS: ${result.trustLabel}`, 20, 75);

    doc.setFontSize(12);
    doc.text('Forensic Summary:', 20, 95);
    const splitSummary = doc.splitTextToSize(result.summary, 170);
    doc.text(splitSummary, 20, 105);

    doc.text('Emergency Recommendations:', 20, 140);
    (doc as any).autoTable({
      startY: 145,
      head: [['Step', 'Action']],
      body: result.recommendations.map((r, i) => [i + 1, r]),
      theme: 'grid',
    });

    doc.save(`EchoShield-Case-${caseNum.substring(0, 8)}.pdf`);
  };

  const trustColors = {
    'Trusted': 'text-accent bg-accent/10 border-accent/20',
    'Suspicious': 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    'Dangerous': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    'Highly Dangerous': 'text-destructive bg-destructive/10 border-destructive/20 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-24">
      {/* Top Header Card */}
      <Card className="glass-card border-white/5 overflow-hidden rounded-[2.5rem] relative">
        <div className={`h-2 w-full ${result.riskLevel === 'malicious' ? 'bg-destructive' : 'bg-accent'}`} />
        <CardContent className="p-8 sm:p-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge className={`rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${trustColors[result.trustLabel]}`}>
                    {result.trustLabel}
                  </Badge>
                  <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Nova AI // Verified</span>
                </div>
                <h2 className="text-5xl font-black tracking-tighter uppercase leading-tight">
                  {result.scamCategory}
                </h2>
                <p className="text-muted-foreground italic font-medium leading-relaxed max-w-xl">
                  {result.summary}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button onClick={() => setShowGrandmaMode(!showGrandmaMode)} className="rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border-primary/20 h-12 px-6">
                  <Heart className="mr-2 h-4 w-4" /> {showGrandmaMode ? 'Show Tech Details' : 'Explain Simply'}
                </Button>
                <Button onClick={handleShare} variant="outline" className="rounded-xl border-white/10 h-12">
                  <Share2 className="mr-2 h-4 w-4" /> Share with Family
                </Button>
              </div>

              <AnimatePresence>
                {showGrandmaMode && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-6 bg-accent/10 border border-accent/20 rounded-3xl space-y-2">
                      <p className="text-[10px] font-black text-accent uppercase tracking-widest">Grandma Mode Enabled</p>
                      <p className="text-lg font-bold text-white/90 leading-tight">"{result.grandmaExplanation}"</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="shrink-0">
              <RiskMeter score={result.riskScore} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Detective Card */}
        <Card className="glass-card border-primary/20 rounded-[2.5rem] lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-primary text-2xl font-black">
              <Search className="h-6 w-6" /> AI DETECTIVE INSIGHTS
            </CardTitle>
            <CardDescription className="text-[10px] font-black tracking-[0.2em] uppercase">What I noticed in this message</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.aiDetectiveInsights.map((insight, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                <div className="p-2 h-fit bg-primary/10 rounded-lg text-primary"><Sparkles className="h-4 w-4" /></div>
                <p className="text-sm font-medium leading-relaxed">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Confidence Meter */}
        <Card className="glass-card border-white/5 rounded-[2.5rem]">
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tighter">Confidence</CardTitle>
            <CardDescription className="text-4xl font-black text-primary">{(result.confidence * 100).toFixed(0)}%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Evidence Found:</p>
            {result.confidenceReasons.map((reason, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-bold text-white/60">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> {reason}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Fake vs Genuine Table */}
      <Card className="glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-white/5 p-8 border-b border-white/5">
          <CardTitle className="text-2xl font-black uppercase tracking-tighter">Fake vs Genuine Comparison</CardTitle>
          <CardDescription className="text-[10px] font-black tracking-widest uppercase">How to spot the difference next time</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 bg-white/5 border-b border-white/5 py-4 px-8 text-[10px] font-black tracking-widest uppercase text-muted-foreground">
            <span>The Scam</span>
            <span>Real Bank / Service</span>
          </div>
          {result.comparisons.map((c, i) => (
            <div key={i} className="grid grid-cols-2 gap-8 p-8 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
              <div className="space-y-1">
                <p className="text-xs font-black text-destructive uppercase tracking-tighter">{c.trait}</p>
                <p className="text-sm font-medium text-white/80">{c.fake}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-accent uppercase tracking-tighter">Verified Standard</p>
                <p className="text-sm font-medium text-white/80">{c.genuine}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Emergency Button & PDF */}
      {result.riskScore > 80 && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 bg-destructive/10 border-2 border-destructive/30 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-3xl font-black text-destructive uppercase tracking-tighter">🚨 Emergency Protocol Active</h3>
            <p className="text-sm font-medium text-destructive-foreground/80 max-w-md">Nova detected a critical threat. Take these actions immediately to protect your assets.</p>
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <Button className="h-14 px-8 rounded-2xl bg-destructive text-white font-black hover:bg-destructive/90 gap-2">
              <PhoneCall className="h-5 w-5" /> Call Family
            </Button>
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-destructive/50 text-destructive font-black gap-2">
              <ShieldX className="h-5 w-5" /> Block Sender
            </Button>
          </div>
        </motion.div>
      )}

      <div className="flex justify-center gap-6">
        <Button onClick={generatePDF} size="lg" className="h-16 px-12 rounded-[2rem] btn-gradient cyber-glow text-lg">
          <Download className="mr-2 h-6 w-6" /> Download Professional PDF
        </Button>
      </div>

      <p className="text-center text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] pb-10">
        "Scammers are already using AI. It's time people had AI on their side too."
      </p>
    </motion.div>
  );
}
