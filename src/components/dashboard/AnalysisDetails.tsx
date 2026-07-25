
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
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
  ShieldCheck,
  CheckCircle,
  FileSearch,
  FileText
} from 'lucide-react';
import { RiskMeter } from './RiskMeter';
import { type AnalyzeScamOutput } from '@/ai/flows/analyze-scam-flow';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface AnalysisDetailsProps {
  result: AnalyzeScamOutput;
  audioUrl: string | null;
  caseId: string | null;
}

export function AnalysisDetails({ result, audioUrl, caseId }: AnalysisDetailsProps) {
  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    const caseNum = caseId?.toUpperCase() || 'TEMP-' + Math.random().toString(36).substring(7).toUpperCase();

    // Enterprise Header
    doc.setFillColor(5, 6, 15);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(0, 183, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ECHOSHIELD AI', 20, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('FORENSIC SECURITY REPORT', 20, 32);
    
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.text(`CASE ID: ${caseNum}`, 140, 25);
    doc.text(`GENERATED: ${timestamp}`, 140, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('1. THREAT CLASSIFICATION', 20, 55);
    
    const riskColor = result.riskScore > 60 ? [239, 68, 68] : result.riskScore > 40 ? [249, 115, 22] : [34, 197, 94];
    doc.setDrawColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.setLineWidth(1);
    doc.line(20, 58, 190, 58);

    doc.setFontSize(18);
    doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.text(`${result.scamType.toUpperCase()}`, 20, 70);
    
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`Risk Score: ${result.riskScore}%`, 20, 80);
    doc.text(`Confidence Level: ${(result.confidence * 100).toFixed(0)}%`, 20, 87);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('2. FORENSIC SUMMARY', 20, 105);
    doc.line(20, 108, 190, 108);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitSummary = doc.splitTextToSize(result.summary, 170);
    doc.text(splitSummary, 20, 115);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('3. MANIPULATION TACTICS', 20, 140);
    doc.line(20, 143, 190, 143);
    
    const tacticsText = result.manipulationTactics.join(', ');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Tactics Identified: ${tacticsText}`, 20, 150);
    
    doc.setFont('helvetica', 'normal');
    const splitPsych = doc.splitTextToSize(result.psychology, 170);
    doc.text(splitPsych, 20, 160);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('4. EMERGENCY PROTOCOL', 20, 190);
    doc.line(20, 193, 190, 193);

    (doc as any).autoTable({
      startY: 198,
      head: [['Step', 'Action Required']],
      body: result.recommendations.map((rec, i) => [i + 1, rec]),
      theme: 'striped',
      headStyles: { fillColor: [0, 183, 255] },
      styles: { fontSize: 9 }
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('EchoShield AI - Automated Forensic Analysis. Confidential and Protective.', 20, 285);
      doc.text(`Page ${i} of ${pageCount}`, 180, 285);
    }

    doc.save(`EchoShield-Forensic-Case-${caseNum.substring(0, 8)}.pdf`);
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
      case 'message': return <MessageSquare className="h-5 w-5" aria-hidden="true" />;
      case 'link': return <ExternalLink className="h-5 w-5" aria-hidden="true" />;
      case 'otp': return <Key className="h-5 w-5" aria-hidden="true" />;
      case 'money': return <Wallet className="h-5 w-5" aria-hidden="true" />;
      case 'risk': return <ShieldAlert className="h-5 w-5" aria-hidden="true" />;
      default: return <Info className="h-5 w-5" aria-hidden="true" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
      role="region"
      aria-label="Forensic Analysis Results"
    >
      <Card className="glass-card border-white/5 overflow-hidden rounded-[2.5rem] relative shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent opacity-50" />
        <CardContent className="p-8 sm:p-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 text-center lg:text-left flex-1">
              <div className="space-y-2">
                <div className="flex items-center justify-center lg:justify-start gap-3">
                   <div className="h-2 w-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                   <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-black">
                     Threat Analysis Protocol {caseId && <span className="text-white/40 ml-2">// CASE ID: {caseId.substring(0, 8).toUpperCase()}</span>}
                   </p>
                </div>
                <h2 className={`text-5xl sm:text-6xl font-black tracking-tighter uppercase leading-tight ${statusColor}`}>
                  {result.scamType}
                </h2>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-4">
                  <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    Confidence: <span className="text-primary">{(result.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-primary" aria-hidden="true" /> Forensic Link Verified
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-xl text-sm font-medium italic">
                {result.summary}
              </p>

              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] font-black tracking-widest uppercase text-primary mb-3 flex items-center gap-2">
                  <FileSearch className="h-3 w-3" aria-hidden="true" /> Forensic Evidence
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.confidenceReasons.map((reason, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-lg border border-primary/20 text-[9px] font-bold text-white uppercase">
                      <CheckCircle className="h-2.5 w-2.5 text-primary" aria-hidden="true" />
                      {reason}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative group shrink-0" aria-label={`Risk score: ${result.riskScore} percent`}>
               <RiskMeter score={result.riskScore} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-primary/20 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-primary">
                <BrainCircuit className="h-7 w-7" aria-hidden="true" />
                Psychology Panel
              </CardTitle>
              <CardDescription className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">
                Detected Manipulation Tactics
              </CardDescription>
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
                <div
                  key={tactic}
                  className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-2 ${
                    isActive 
                    ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_20px_rgba(0,183,255,0.2)]' 
                    : 'bg-white/5 border-white/5 text-muted-foreground opacity-40 grayscale'
                  }`}
                  aria-label={`${tactic}: ${isActive ? 'Detected' : 'Not detected'}`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-transparent'}`} aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{tactic}</span>
                  {isActive && <div className="absolute top-2 right-2" aria-hidden="true"><ShieldAlert className="h-3 w-3" /></div>}
                </div>
              );
            })}
          </div>
          <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-3xl">
            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
              <Info className="h-3 w-3" aria-hidden="true" /> Forensic Psychologist Note
            </h4>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              {result.psychology}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card border-white/5 rounded-[2rem] hover:border-destructive/20 transition-colors">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center text-xl font-black gap-3 text-destructive uppercase tracking-tighter">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" /> 
              Behavioral Red Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="space-y-3">
              {result.redFlags.map((flag, i) => (
                <div 
                  key={i} 
                  className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group hover:bg-white/10 transition-colors"
                >
                  <div className="h-2 w-2 rounded-full bg-destructive shadow-[0_0_12px_rgba(239,68,68,1)] flex-shrink-0" aria-hidden="true" />
                  <span className="text-[11px] font-black tracking-widest text-white/80 uppercase">{flag}</span>
                </div>
              ))}
            </div>
            {audioUrl && (
              <div className="mt-6 space-y-4">
                <Button 
                  className="w-full h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center gap-3 text-primary hover:bg-primary/10 transition-all group shadow-lg"
                  onClick={playAudio}
                  aria-label="Play AI voice security warning"
                >
                  <Volume2 className="h-5 w-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  <span className="font-black text-xs uppercase tracking-[0.2em]">Play Forensic Audio Warning</span>
                </Button>
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                  <p className="text-[10px] font-black tracking-widest text-primary uppercase mb-2">Audio Transcript</p>
                  <p className="text-xs font-medium text-muted-foreground italic leading-relaxed">
                    "Warning: Threat detected. This communication has been identified as a {result.scamType}. Accessing or complying with these instructions poses a high security risk. Please review the forensic recommendations immediately."
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/20 rounded-[2rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center text-xl font-black gap-3 text-accent uppercase tracking-tighter">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" /> 
              Emergency Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            {result.recommendations.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                <ShieldCheck className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
                <span className="text-[11px] font-black text-white/90 uppercase tracking-tighter">{item}</span>
              </div>
            ))}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-xl border-white/10 font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-white/5" 
                onClick={generatePDF}
                aria-label="Download analysis as PDF report"
              >
                <FileText className="h-4 w-4" aria-hidden="true" /> Download PDF Report
              </Button>
              <Button 
                className="flex-1 h-12 rounded-xl btn-gradient font-black uppercase text-[10px] tracking-widest"
                aria-label="Verify forensic chain of custody"
              >
                Chain of Custody
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
