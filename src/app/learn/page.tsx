
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, BookOpen, Fingerprint, Lock, Zap, CheckCircle, ArrowRight, Play, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScamSimulator } from '@/components/dashboard/ScamSimulator';

const MODULES = [
  {
    id: 'social-engineering',
    title: "Social Engineering 101",
    desc: "Learn how scammers use psychology and urgency to bypass your logic.",
    icon: <Zap className="h-6 w-6" />,
    difficulty: "Beginner",
    points: [
      "Artificial Urgency (e.g. 'Your account is locked!')",
      "Fear Tactics (e.g. 'Police are on their way.')",
      "Authority Impersonation (e.g. Bank Manager, Support Agent)"
    ],
    scenario: "A bank manager calls you saying your account has been compromised and you need to move funds immediately."
  },
  {
    id: 'deepfake-detection',
    title: "Deepfake Detection",
    desc: "Spot the subtle clues of AI-generated voices and faces.",
    icon: <Fingerprint className="h-6 w-6" />,
    difficulty: "Advanced",
    points: [
      "Unnatural speech rhythms and breathing.",
      "Monotone robotic intonations.",
      "Unusual payment requests (Gift cards, Crypto)."
    ],
    scenario: "An AI clone of your grandchild calls you in distress asking for urgent bail money."
  },
  {
    id: 'phishing-forensics',
    title: "Phishing Forensics",
    desc: "Identify dangerous links and sender addresses before you click.",
    icon: <Lock className="h-6 w-6" />,
    difficulty: "Intermediate",
    points: [
      "Mismatched domain names (e.g. b-ank.com vs bank.com).",
      "Generic greetings (e.g. 'Dear Valued Customer').",
      "Hidden URL parameters."
    ],
    scenario: "You receive a message from 'FedEx' about a missed delivery with a suspicious tracking link."
  }
];

export default function LearnPage() {
  const [activeModule, setActiveModule] = useState<typeof MODULES[0] | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);

  const handleStartModule = (module: typeof MODULES[0]) => {
    setActiveModule(module);
  };

  const handleLaunchSimulator = (scenario: string) => {
    setCurrentScenario(scenario);
    setIsSimulatorOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/20 rounded-2xl cyber-glow">
            < BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Safety Academy</h1>
        </div>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl">
          The best defense is an educated mind. Master the art of detecting deception.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MODULES.map((module, i) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full glass-card border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all flex flex-col group">
              <CardHeader className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">{module.icon}</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">{module.difficulty}</span>
                </div>
                <CardTitle className="text-2xl font-black">{module.title}</CardTitle>
                <CardDescription className="text-sm font-medium leading-relaxed">{module.desc}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between">
                <div className="space-y-4 mb-8">
                  {module.points.map((point, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-muted-foreground">{point}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => handleStartModule(module)}
                  className="w-full rounded-xl bg-white/5 hover:bg-primary hover:text-white border-white/5 font-bold transition-all"
                >
                  Start Module
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <section className="glass-card rounded-[3rem] p-8 md:p-12 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Shield className="h-64 w-64" />
        </div>
        <div className="max-w-2xl space-y-6 relative z-10">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            AI Scam Simulator
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            Test your skills in a safe environment. Interact with simulated scammers and see if you can spot the red flags in real-time.
          </p>
          <Button 
            onClick={() => handleLaunchSimulator("A suspicious text message from an unknown number claiming to be your bank.")}
            size="lg" 
            className="rounded-2xl btn-gradient cyber-glow px-8 h-14 text-lg font-black"
          >
            LAUNCH SIMULATOR
          </Button>
        </div>
      </section>

      {/* Module Detail Dialog */}
      <Dialog open={!!activeModule} onOpenChange={(open) => !open && setActiveModule(null)}>
        <DialogContent className="max-w-3xl glass-card rounded-[3.5rem] p-0 border-white/5 overflow-hidden z-[101]">
          {activeModule ? (
            <div className="flex flex-col">
              <DialogHeader className="p-8 bg-primary/10 border-b border-white/5 space-y-4 text-left">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-2xl text-primary">{activeModule.icon}</div>
                  <div>
                    <DialogTitle className="text-3xl font-black tracking-tighter uppercase">{activeModule.title}</DialogTitle>
                    <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-primary/70">{activeModule.difficulty} Defense Protocol</DialogDescription>
                  </div>
                </div>
                <p className="text-lg font-medium text-white/90 leading-relaxed italic">
                  "{activeModule.desc}"
                </p>
              </DialogHeader>
              
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Info className="h-4 w-4" /> Core Concepts
                    </h3>
                    <ul className="space-y-3">
                      {activeModule.points.map((p, i) => (
                        <li key={i} className="flex gap-3 text-sm font-medium text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-accent flex items-center gap-2">
                      <Play className="h-4 w-4" /> Interactive Triage
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Ready to apply what you've learned? Launch the Nova Simulator to test your resistance against this specific threat vector.
                    </p>
                    <Button 
                      onClick={() => handleLaunchSimulator(activeModule.scenario)}
                      className="w-full rounded-xl bg-accent/20 text-accent hover:bg-accent hover:text-white transition-all font-bold"
                    >
                      Practice Scenario
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <Button onClick={() => setActiveModule(null)} variant="ghost" className="rounded-xl font-bold gap-2">
                    Complete Module <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <DialogTitle className="sr-only">Loading Module</DialogTitle>
              <DialogDescription className="sr-only">Please wait while the module defense protocols are initialized.</DialogDescription>
              < BookOpen className="h-12 w-12 text-primary animate-pulse mx-auto" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Simulator Dialog */}
      <Dialog open={isSimulatorOpen} onOpenChange={setIsSimulatorOpen}>
        <DialogContent className="max-w-2xl glass-card rounded-[3.5rem] p-0 border-white/5 overflow-hidden z-[101]">
          <DialogHeader className="sr-only">
            <DialogTitle>Nova Scam Simulator</DialogTitle>
            <DialogDescription>Experience and identify social engineering threats in a safe environment.</DialogDescription>
          </DialogHeader>
          <ScamSimulator scenario={currentScenario || "A suspicious text message from an unknown number claiming to be your bank."} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
