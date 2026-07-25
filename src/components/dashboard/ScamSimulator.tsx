'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Ghost, Send, AlertTriangle, CheckCircle, ShieldAlert, Brain, Loader2, RefreshCw } from 'lucide-react';
import { continueSimulation, type SimulationOutput } from '@/ai/flows/scam-simulator-flow';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ScamSimulatorProps {
  scenario: string;
}

export function ScamSimulator({ scenario }: ScamSimulatorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [result, setResult] = useState<SimulationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const startSim = async () => {
    setLoading(true);
    setIsEnded(false);
    setResult(null);
    setMessages([]);
    setError(null);
    try {
      const res = await continueSimulation({ scenario, history: [] });
      setMessages([{ role: 'model', content: res.message }]);
    } catch (e: any) {
      const errorMsg = e.message || 'Nova could not establish the adversary connection.';
      setError(errorMsg);
      toast({ 
        variant: 'destructive', 
        title: 'Simulator Link Failed',
        description: errorMsg 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startSim();
  }, [scenario]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || isEnded) return;

    const userMsg = input.trim();
    const currentHistory: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(currentHistory);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await continueSimulation({ scenario, history: currentHistory });
      setMessages([...currentHistory, { role: 'model', content: res.message }]);
      if (res.isEnded) {
        setIsEnded(true);
        setResult(res);
      }
    } catch (e: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Simulator Desync',
        description: e.message || 'The simulation link was interrupted.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto space-y-4">
      <Card className="flex-1 flex flex-col glass-card border-white/5 rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-white/5 border-b border-white/5 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Ghost className="h-5 w-5" /></div>
            <div className="flex-1">
              <CardTitle className="text-lg font-black uppercase tracking-tighter">Live Scam Simulation</CardTitle>
              <CardDescription className="text-[10px] font-black tracking-widest uppercase">Safe Forensic Environment</CardDescription>
            </div>
            {isEnded && (
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${result?.didVictimFallForIt ? 'bg-destructive/20 text-destructive' : 'bg-accent/20 text-accent'}`}>
                {result?.didVictimFallForIt ? 'User Compromised' : 'Threat Blocked'}
              </div>
            )}
            <Button variant="ghost" size="icon" className="rounded-full" onClick={startSim} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl mb-8">
                <p className="text-[10px] font-black text-primary uppercase mb-1 tracking-widest">Active Threat Scenario</p>
                <p className="text-sm font-medium italic opacity-70">"{scenario}"</p>
              </div>

              {error && (
                <div className="p-8 text-center space-y-4">
                  <ShieldAlert className="h-12 w-12 text-destructive mx-auto opacity-50" />
                  <p className="text-sm font-bold text-destructive/80 uppercase tracking-widest">{error}</p>
                  <Button onClick={startSim} variant="outline" className="rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10">
                    Retry Intelligence Link
                  </Button>
                </div>
              )}

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${m.role === 'user' ? 'bg-primary text-white rounded-tr-none shadow-lg' : 'bg-white/10 text-white rounded-tl-none border border-white/5 shadow-md'}`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <AnimatePresence>
            {isEnded && result && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className={`p-6 border-t border-white/5 space-y-4 ${result.didVictimFallForIt ? 'bg-destructive/10' : 'bg-accent/10'}`}
              >
                <div className="flex items-center gap-3">
                  {result.didVictimFallForIt ? <ShieldAlert className="h-6 w-6 text-destructive" /> : <CheckCircle className="h-6 w-6 text-accent" />}
                  <h4 className="font-black uppercase tracking-tighter">
                    {result.didVictimFallForIt ? 'Simulation Result: Critical Security Breach' : 'Simulation Result: Threat Deflected'}
                  </h4>
                </div>
                <p className="text-sm font-medium leading-relaxed italic opacity-90">
                  {result.educationalInsight || (result.didVictimFallForIt ? "The simulation has ended because sensitive information was exposed. In a real scenario, your assets would now be at risk." : "Great work. You maintained your guard and identified the manipulation cues.")}
                </p>
                <Button onClick={startSim} variant="outline" className="w-full rounded-xl border-white/10 font-black uppercase text-[10px] tracking-widest h-12">Initialize New Protocol</Button>
              </motion.div>
            )}
          </AnimatePresence>

          {!isEnded && !error && (
            <div className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
              <Input
                placeholder="Type your response to the threat..."
                className="bg-white/5 border-white/10 rounded-xl h-12"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={loading}
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()} className="h-12 w-12 rounded-xl btn-gradient">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">
        <Brain className="h-3 w-3" /> Nova Security Training Environment
      </div>
    </div>
  );
}
