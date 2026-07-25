
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Upload, AlertCircle, Play, FileText, CheckCircle2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { analyzeScam, type AnalyzeScamOutput } from '@/ai/flows/analyze-scam-flow';
import { generateVoiceWarning } from '@/ai/flows/voice-warning-flow';

export default function Dashboard() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeScamOutput | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

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

        // Generate voice warning for high risk
        if (analysis.score > 50) {
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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Security Dashboard</h1>
          <p className="text-muted-foreground">Upload content to detect potential threats.</p>
        </div>
        <Button variant="outline" className="border-primary/20"><History className="mr-2 h-4 w-4" /> History</Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload & Scanner */}
        <Card className="lg:col-span-1 glass-card border-primary/20">
          <CardHeader>
            <CardTitle>Threat Scanner</CardTitle>
            <CardDescription>Upload screenshots or voice memos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-primary/20 rounded-xl p-10 text-center space-y-4 hover:border-primary/40 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileUpload}
                accept="image/*,audio/*"
                disabled={analyzing}
              />
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium">Click to upload or drag & drop</p>
              <p className="text-xs text-muted-foreground">Screenshots (PNG/JPG) or Voice (MP3/WAV)</p>
            </div>

            {analyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>AI Scanning...</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Card */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center glass-card rounded-2xl p-20 text-center border-white/5"
              >
                <ShieldAlert className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Ready for Scan</h3>
                <p className="text-muted-foreground">Upload a file to begin the AI analysis.</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Risk Meter */}
                <Card className="glass-card border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm uppercase tracking-wider text-muted-foreground font-bold">Threat Level</p>
                        <h2 className={`text-4xl font-black ${result.score > 70 ? 'text-destructive' : result.score > 40 ? 'text-orange-500' : 'text-accent'}`}>
                          {result.score > 70 ? 'CRITICAL' : result.score > 40 ? 'WARNING' : 'SECURE'}
                        </h2>
                      </div>
                      <div className="relative h-24 w-24">
                        <svg className="h-24 w-24 -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                          <circle 
                            cx="48" cy="48" r="40" 
                            stroke="currentColor" strokeWidth="8" fill="transparent" 
                            strokeDasharray={2 * Math.PI * 40}
                            strokeDashoffset={2 * Math.PI * 40 * (1 - result.score / 100)}
                            className={result.score > 70 ? 'text-destructive' : result.score > 40 ? 'text-orange-500' : 'text-accent'}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-bold text-xl">{result.score}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Explanation */}
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center"><AlertCircle className="mr-2 h-5 w-5 text-primary" /> Analysis Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm leading-relaxed">{result.explanation}</p>
                      {audioUrl && (
                        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-4">
                          <Button size="icon" className="rounded-full" onClick={() => new Audio(audioUrl).play()}>
                            <Play className="h-4 w-4" />
                          </Button>
                          <div className="text-xs">
                            <p className="font-bold text-primary">AI Voice Alert</p>
                            <p className="text-muted-foreground">Generated by ElevenLabs</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Red Flags */}
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center"><ShieldAlert className="mr-2 h-5 w-5 text-destructive" /> Red Flags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.redFlags.map((flag, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-destructive font-bold">•</span> {flag}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Advice & Checklist */}
                  <Card className="md:col-span-2 glass-card border-accent/20">
                    <CardHeader>
                      <CardTitle className="flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-accent" /> Action Checklist</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        {result.checklist.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg text-sm border border-white/5">
                            <CheckCircle2 className="h-4 w-4 text-accent" /> {item}
                          </div>
                        ))}
                      </div>
                      <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
                        <h4 className="font-bold text-accent mb-2">Expert Advice</h4>
                        <p className="text-xs leading-relaxed">{result.advice}</p>
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
