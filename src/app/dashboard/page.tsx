'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Upload, AlertCircle, Play, FileText, CheckCircle2, History, Loader2, Volume2, Fingerprint, MessageSquare, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { analyzeScam, type AnalyzeScamOutput } from '@/ai/flows/analyze-scam-flow';
import { generateVoiceWarning } from '@/ai/flows/voice-warning-flow';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeScamOutput | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [chatText, setChatText] = useState('');
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function processAnalysis(type: 'text' | 'image' | 'voice', content: string) {
    setAnalyzing(true);
    setResult(null);
    setAudioUrl(null);

    try {
      const analysis = await analyzeScam({ type, content });
      setResult(analysis);

      if (user) {
        addDoc(collection(db, 'analyses'), {
          userId: user.uid,
          type,
          ...analysis,
          timestamp: serverTimestamp(),
        });
      }

      if (analysis.score > 40) {
        const warning = await generateVoiceWarning(analysis.verdict);
        setAudioUrl(warning);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Failed to connect to the intelligence network.',
      });
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const type = file.type.startsWith('image') ? 'image' : 
                   file.type.startsWith('audio') ? 'voice' : 'text';
      processAnalysis(type as any, base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleChatSubmit() {
    if (!chatText.trim()) return;
    processAnalysis('text', chatText);
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
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Input Terminal */}
        <Card className="xl:col-span-1 glass-card border-primary/20 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-2xl">Triage Center</CardTitle>
            <CardDescription>Upload or paste suspicious content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 rounded-xl">
                <TabsTrigger value="upload" className="rounded-lg font-bold">Files</TabsTrigger>
                <TabsTrigger value="chat" className="rounded-lg font-bold">Chat Paste</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="pt-4">
                <div className="group border-2 border-dashed border-primary/20 rounded-3xl p-8 text-center space-y-4 hover:border-primary transition-all cursor-pointer relative bg-primary/5 hover:bg-primary/10">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleFileUpload}
                    accept="image/*,audio/*"
                    disabled={analyzing}
                  />
                  <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    {analyzing ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : <Upload className="h-8 w-8 text-primary" />}
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold">Screenshots / Audio</p>
                    <p className="text-xs text-muted-foreground">Drop banking chats or voice clips</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chat" className="pt-4 space-y-4">
                <Textarea 
                  placeholder="Paste WhatsApp, Telegram, or SMS messages here..." 
                  className="min-h-[150px] bg-white/5 border-white/10 rounded-2xl p-4 focus:ring-primary"
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  disabled={analyzing}
                />
                <Button 
                  className="w-full h-12 rounded-xl btn-gradient cyber-glow" 
                  onClick={handleChatSubmit}
                  disabled={analyzing || !chatText.trim()}
                >
                  {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                  Analyze Chat History
                </Button>
              </TabsContent>
            </Tabs>

            {analyzing && (
              <div className="space-y-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 animate-pulse">
                <div className="flex justify-between text-[10px] font-black tracking-widest text-primary uppercase">
                  <span>Deconstructing Metadata</span>
                  <span>Active</span>
                </div>
                <Progress value={analyzing ? 90 : 0} className="h-1 bg-white/5" />
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
                className="h-[500px] flex flex-col items-center justify-center glass-card rounded-[2rem] p-12 text-center border-white/5"
              >
                <div className="relative mb-8">
                  <ShieldAlert className="h-24 w-24 text-white/5" />
                  <motion.div 
                    animate={{ opacity: [0.2, 0.5, 0.2] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Fingerprint className="h-12 w-12 text-primary" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold">Scanning for Vulnerabilities</h3>
                <p className="text-muted-foreground max-w-sm mt-2">The AI is ready. Provide content to initiate the behavioral triage sequence.</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {/* Risk Meter Card */}
                <Card className="glass-card border-primary/20 overflow-hidden rounded-[2rem]">
                  <div className={`h-2 w-full transition-all duration-1000 ${result.score > 70 ? 'bg-destructive' : result.score > 40 ? 'bg-orange-500' : 'bg-accent'}`} />
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
                      
                      <div className="relative h-48 w-48">
                        <svg className="h-48 w-48 -rotate-90">
                          <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-white/5" />
                          <motion.circle 
                            cx="96" cy="96" r="84" 
                            stroke="currentColor" strokeWidth="16" fill="transparent" 
                            strokeDasharray={2 * Math.PI * 84}
                            initial={{ strokeDashoffset: 2 * Math.PI * 84 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 84 * (1 - result.score / 100) }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={result.score > 70 ? 'text-destructive' : result.score > 40 ? 'text-orange-500' : 'text-accent'}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-black text-5xl tracking-tighter">{result.score}%</span>
                          <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Risk Index</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Educational Breakdown */}
                  <Card className="glass-card border-white/5 rounded-[2rem] bg-gradient-to-br from-white/[0.02] to-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl font-black"><BookOpen className="mr-3 h-6 w-6 text-primary" /> Forensic Analysis</CardTitle>
                      <CardDescription>Understanding the deception tactics.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-muted-foreground leading-relaxed font-medium">{result.explanation}</p>
                      
                      {audioUrl && (
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }} 
                          animate={{ y: 0, opacity: 1 }}
                          className="p-6 bg-primary/10 rounded-3xl border border-primary/20 flex items-center gap-6"
                        >
                          <Button 
                            size="icon" 
                            className="h-16 w-16 rounded-2xl bg-primary shadow-lg shadow-primary/20 hover:scale-110 transition-transform" 
                            onClick={() => audioRef.current?.play()}
                          >
                            <Volume2 className="h-8 w-8" />
                          </Button>
                          <div>
                            <p className="font-black text-primary tracking-tight text-lg">Protective AI Alert</p>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Urgent Audio Synthesis</p>
                          </div>
                          <audio ref={audioRef} src={audioUrl} className="hidden" />
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Manipulation Flags */}
                  <Card className="glass-card border-white/5 rounded-[2rem]">
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl font-black"><AlertTriangle className="mr-3 h-6 w-6 text-destructive" /> Manipulation Vectors</CardTitle>
                      <CardDescription>Identified social engineering traits.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.redFlags.map((flag, i) => (
                          <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 hover:border-destructive/30 transition-all"
                          >
                            <div className="h-2 w-2 rounded-full bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                            <span className="text-sm font-bold tracking-tight">{flag}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Countermeasures */}
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
                        <Button className="mt-8 rounded-xl bg-accent hover:bg-accent/90 text-white font-black shadow-lg shadow-accent/20">REPORT INCIDENT</Button>
                      </div>
                    </div>
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

import { BookOpen } from 'lucide-react';
