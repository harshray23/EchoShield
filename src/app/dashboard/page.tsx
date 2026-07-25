'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Upload, AlertCircle, Play, FileText, CheckCircle2, History, Loader2, Volume2, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { analyzeScam, type AnalyzeScamOutput } from '@/ai/flows/analyze-scam-flow';
import { generateVoiceWarning } from '@/ai/flows/voice-warning-flow';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Dashboard() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeScamOutput | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setResult(null);
    setAudioUrl(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        const type = file.type.startsWith('image') ? 'image' : 
                     file.type.startsWith('audio') ? 'voice' : 'text';

        const analysis = await analyzeScam({ type: type as any, content: base64 });
        setResult(analysis);

        // Save to Firestore if logged in
        if (user) {
          addDoc(collection(db, 'analyses'), {
            userId: user.uid,
            type,
            ...analysis,
            timestamp: serverTimestamp(),
          });
        }

        // Generate voice warning for high risk
        if (analysis.score > 40) {
          const warning = await generateVoiceWarning(analysis.verdict);
          setAudioUrl(warning);
        }

        setAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Failed to analyze the file. Please try again.',
      });
      setAnalyzing(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-10">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Fingerprint className="h-10 w-10 text-primary" />
            Security Console
          </h1>
          <p className="text-muted-foreground font-medium">Real-time threat detection and forensic analysis.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5">
            <History className="mr-2 h-4 w-4" /> Scan History
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Input Terminal */}
        <Card className="xl:col-span-1 glass-card border-primary/20 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-2xl">Target Input</CardTitle>
            <CardDescription>Upload suspected evidence for AI triage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="group border-2 border-dashed border-primary/20 rounded-3xl p-12 text-center space-y-4 hover:border-primary transition-all cursor-pointer relative bg-primary/5 hover:bg-primary/10">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileUpload}
                accept="image/*,audio/*"
                disabled={analyzing}
              />
              <div className="bg-primary/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                {analyzing ? (
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                ) : (
                  <Upload className="h-10 w-10 text-primary" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold">Initiate Scan</p>
                <p className="text-sm text-muted-foreground">Screenshots or Voice Memos</p>
              </div>
            </div>

            {analyzing && (
              <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5 animate-pulse">
                <div className="flex justify-between text-xs font-bold tracking-widest text-primary">
                  <span>ANALYZING PATTERNS</span>
                  <span>PROC: 88%</span>
                </div>
                <Progress value={88} className="h-2 bg-white/10" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Intelligence Output */}
        <div className="xl:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[400px] flex flex-col items-center justify-center glass-card rounded-[2rem] p-12 text-center border-white/5"
              >
                <ShieldAlert className="h-20 w-20 text-white/10 mb-6" />
                <h3 className="text-2xl font-bold">Awaiting Scan</h3>
                <p className="text-muted-foreground max-w-sm">System idle. Please provide input to begin the behavioral analysis sequence.</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Score & Verdict */}
                <Card className="glass-card border-primary/20 overflow-hidden rounded-[2rem]">
                  <div className={`h-2 w-full ${result.score > 70 ? 'bg-destructive' : result.score > 40 ? 'bg-orange-500' : 'bg-accent'}`} />
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="space-y-2 text-center md:text-left">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-black">Threat Level Assessment</p>
                        <h2 className={`text-6xl font-black tracking-tighter ${result.score > 70 ? 'text-destructive' : result.score > 40 ? 'text-orange-500' : 'text-accent'}`}>
                          {result.score > 70 ? 'CRITICAL' : result.score > 40 ? 'WARNING' : 'SECURE'}
                        </h2>
                        <p className="text-lg font-medium opacity-80">{result.verdict}</p>
                      </div>
                      
                      <div className="relative h-40 w-40">
                        <svg className="h-40 w-40 -rotate-90">
                          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                          <motion.circle 
                            cx="80" cy="80" r="70" 
                            stroke="currentColor" strokeWidth="12" fill="transparent" 
                            strokeDasharray={2 * Math.PI * 70}
                            initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - result.score / 100) }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={result.score > 70 ? 'text-destructive' : result.score > 40 ? 'text-orange-500' : 'text-accent'}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-black text-4xl">{result.score}%</span>
                          <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Risk Score</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Forensic Breakdown */}
                  <Card className="glass-card border-white/5 rounded-[2rem]">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl font-bold"><AlertCircle className="mr-3 h-6 w-6 text-primary" /> Intelligence Report</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-muted-foreground leading-relaxed">{result.explanation}</p>
                      
                      {audioUrl && (
                        <div className="p-6 bg-primary/10 rounded-3xl border border-primary/20 flex items-center gap-6 group hover:bg-primary/15 transition-colors">
                          <Button 
                            size="icon" 
                            className="h-14 w-14 rounded-2xl shadow-xl hover:scale-110 transition-transform" 
                            onClick={() => {
                              if (audioRef.current) audioRef.current.play();
                            }}
                          >
                            <Volume2 className="h-6 w-6" />
                          </Button>
                          <div className="space-y-1">
                            <p className="font-black text-primary tracking-tight">AI VOICE ALERT</p>
                            <p className="text-xs text-muted-foreground font-medium">Critical warning synthesized.</p>
                          </div>
                          <audio ref={audioRef} src={audioUrl} className="hidden" />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Red Flags Terminal */}
                  <Card className="glass-card border-white/5 rounded-[2rem]">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl font-bold"><ShieldAlert className="mr-3 h-6 w-6 text-destructive" /> Threat Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.redFlags.map((flag, i) => (
                          <motion.div 
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3"
                          >
                            <div className="mt-1 h-2 w-2 rounded-full bg-destructive shadow-[0_0_8px_red]" />
                            <span className="text-sm font-semibold tracking-tight">{flag}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Checklist */}
                  <Card className="md:col-span-2 glass-card border-accent/20 rounded-[2rem]">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl font-bold"><CheckCircle2 className="mr-3 h-6 w-6 text-accent" /> Countermeasures</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        {result.checklist.map((item, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl text-sm border border-white/5 hover:border-accent/30 transition-all">
                            <CheckCircle2 className="h-5 w-5 text-accent" /> 
                            <span className="font-medium">{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-8 bg-accent/5 rounded-[2rem] border border-accent/10 flex flex-col justify-center">
                        <h4 className="font-black text-accent mb-4 tracking-widest uppercase text-xs">Protective Strategy</h4>
                        <p className="text-sm leading-relaxed font-medium opacity-80">{result.advice}</p>
                        <Button className="mt-8 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold">Download Full Evidence Report</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}