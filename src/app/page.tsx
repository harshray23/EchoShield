
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Eye, MessageSquare, Mic, Image as ImageIcon, ArrowRight, CheckCircle, AlertTriangle, Fingerprint, Search, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [demoStep, setDemoStep] = useState(0);

  // Auto-playing hero simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden bg-background">
      {/* Background Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-6xl w-full text-center space-y-8 py-20 relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="flex justify-center mb-6">
            <motion.div 
              animate={{ rotateY: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="p-1 rounded-[3rem] bg-primary/5 border border-primary/10 cyber-glow"
            >
              <img src="/logo.jpg" alt="EchoShield AI Logo" className="h-52 w-52 object-contain rounded-[2.9rem] shadow-sm" />
            </motion.div>
          </div>
          <h1 className="text-7xl font-black tracking-tighter sm:text-9xl neon-text mb-4 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80 leading-none">
            EchoShield AI
          </h1>
          <p className="text-3xl font-black text-primary tracking-tighter uppercase italic">
            Hear the Truth Before You Trust.
          </p>
          <p className="max-w-3xl mx-auto text-xl text-muted-foreground font-medium leading-relaxed">
            Advanced forensic protection against AI deepfakes, phishing, and social engineering. 
            The digital armor for your family.
          </p>
        </motion.div>

        {/* WOW Hero Interaction Simulation */}
        <div className="w-full max-w-2xl mt-16 p-1 bg-gradient-to-br from-primary/30 via-white/5 to-accent/30 rounded-[3rem] shadow-2xl relative">
          <div className="bg-card rounded-[2.9rem] p-8 md:p-12 h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
             <div className="scanline opacity-20" />
             
             <AnimatePresence mode="wait">
               {demoStep === 0 && (
                 <motion.div key="step0" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="space-y-4">
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 animate-pulse">
                      <MessageSquare className="h-6 w-6 text-primary" />
                      <p className="text-sm font-bold text-left">Incoming: "Urgent! Your account is blocked. Update KYC now..."</p>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Monitoring Protocol Active</p>
                 </motion.div>
               )}
               {demoStep === 1 && (
                 <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <Search className="h-20 w-20 text-primary animate-bounce" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 border-4 border-primary rounded-full" />
                    </div>
                    <p className="text-xl font-black uppercase tracking-widest text-primary animate-pulse">Analyzing Neural Patterns...</p>
                 </motion.div>
               )}
               {demoStep === 2 && (
                 <motion.div key="step2" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="p-6 bg-red-600/20 border-2 border-red-600 rounded-3xl shadow-[0_0_30px_rgba(255,0,0,0.4)]">
                      <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                      <h3 className="text-2xl font-black text-red-600 uppercase">THREAT DETECTED</h3>
                    </div>
                    <p className="text-xs font-bold text-white uppercase tracking-widest">98% FRAUD PROBABILITY</p>
                 </motion.div>
               )}
               {demoStep === 3 && (
                 <motion.div key="step3" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="p-6 bg-accent/20 border-2 border-accent rounded-3xl shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                      <CheckCircle className="h-12 w-12 text-accent mx-auto mb-2" />
                      <h3 className="text-2xl font-black text-accent uppercase">USER PROTECTED</h3>
                    </div>
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Nova Shield Active</p>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-16"
        >
          <Button size="lg" className="h-18 px-14 text-2xl btn-gradient cyber-glow rounded-[2rem] font-black uppercase tracking-tighter" asChild>
            <Link href="/dashboard">
              Analyze Now <ArrowRight className="ml-3 h-8 w-8" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-18 px-12 text-xl border-border rounded-[2rem] bg-card hover:bg-card/85 font-bold uppercase tracking-widest text-foreground" asChild>
            <Link href="/learn">Safety Academy</Link>
          </Button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-10 py-24">
        <FeatureCard 
          icon={<ImageIcon className="h-12 w-12" />} 
          title="X-Ray Scanner" 
          desc="Upload chats or banking screenshots. Nova highlights hidden phishing DNA and impersonation cues."
          delay={0.2}
        />
        <FeatureCard 
          icon={<Mic className="h-12 w-12" />} 
          title="Voice Forensic" 
          desc="Instant detection of AI-cloned voices and high-pressure social engineering tactics."
          delay={0.4}
        />
        <FeatureCard 
          icon={<Zap className="h-12 w-12" />} 
          title="Regional Triage" 
          desc="Support for 6+ languages. Specifically tuned to identify scams common in India like UPI & KYC fraud."
          delay={0.6}
        />
      </section>

      {/* Trust Badges */}
      <section className="max-w-6xl w-full border-t border-border py-16 flex flex-wrap justify-center gap-16 opacity-40">
        <div className="flex items-center gap-3 font-black text-sm tracking-[0.3em]"><Lock className="h-5 w-5" /> SECURE VAULT</div>
        <div className="flex items-center gap-3 font-black text-sm tracking-[0.3em]"><CheckCircle className="h-5 w-5" /> GEMINI POWERED</div>
        <div className="flex items-center gap-3 font-black text-sm tracking-[0.3em]"><AlertTriangle className="h-5 w-5" /> FORENSIC GRADE</div>
      </section>

      <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[1em] pb-12 opacity-30">
        "Scammers are already using AI. It's time people had AI on their side too."
      </p>

      {/* Footer Decoration */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, translateY: -10 }}
      className="glass-card p-12 rounded-[3rem] space-y-8 border-white/5 hover:border-primary/30 transition-all cursor-default relative group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Fingerprint className="h-24 w-24 text-primary" />
      </div>
      <div className="p-4 w-fit rounded-2xl bg-primary/10 text-primary cyber-glow">{icon}</div>
      <div className="space-y-4 relative z-10">
        <h3 className="text-3xl font-black tracking-tighter uppercase">{title}</h3>
        <p className="text-muted-foreground font-medium leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}
