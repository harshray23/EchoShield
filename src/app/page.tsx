'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Eye, MessageSquare, Mic, Image as ImageIcon, ArrowRight, CheckCircle, AlertTriangle, Fingerprint, Search, Zap, ChevronDown, Cpu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [demoStep, setDemoStep] = useState(0);

  // Auto-playing hero simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 4);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen relative overflow-hidden bg-background">
      
      {/* Premium Floating Pill Navbar */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl px-6 py-3 flex justify-between items-center bg-card/65 backdrop-blur-xl border border-white/40 shadow-[0_12px_40px_rgba(124,77,255,0.03)] rounded-full">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="EchoShield AI Logo" className="h-8 w-8 object-contain rounded-lg" />
          <span className="text-lg font-black tracking-tighter text-foreground uppercase">EchoShield AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            Console
          </Link>
          <Link href="/learn" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            Academy
          </Link>
          <Link href="/about" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            About
          </Link>
        </nav>
        <div>
          <Button size="sm" className="rounded-full px-6 btn-gradient text-[10px] uppercase tracking-widest font-black" asChild>
            <Link href="/dashboard">Enter Console</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl w-full text-center space-y-10 pt-40 pb-20 px-6 relative z-10 flex flex-col items-center">
        
        {/* Animated Feature pill */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-widest shadow-sm"
        >
          <Sparkles className="h-3 w-3 animate-pulse" /> Next-Gen Threat Forensic Protection
        </motion.div>

        {/* Redesigned Typography Headlines */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="space-y-6 max-w-4xl"
        >
          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-foreground leading-none">
            Hear the Truth.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Before You Trust.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium leading-relaxed">
            EchoShield AI delivers advanced real-time deepfake analysis, semantic triage, and social engineering deflection to secure your family and business.
          </p>
        </motion.div>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
        >
          <Button size="lg" className="h-14 px-8 text-xs btn-gradient rounded-full font-black uppercase tracking-widest w-full sm:w-auto hover:scale-105 transition-all" asChild>
            <Link href="/dashboard">
              Launch Shield <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-xs border-border bg-card/40 hover:bg-card/80 text-foreground rounded-full font-black uppercase tracking-widest w-full sm:w-auto" asChild>
            <Link href="/learn">Safety Academy</Link>
          </Button>
        </motion.div>

        {/* Scrolling Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="pt-10 text-muted-foreground opacity-50 flex flex-col items-center gap-1 cursor-pointer"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Explore System Architecture</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>

        {/* Live Interface Device Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="w-full max-w-3xl mt-12 p-1.5 bg-gradient-to-br from-primary/20 via-white/5 to-accent/20 rounded-[2.5rem] shadow-2xl relative"
        >
          <div className="bg-card/75 backdrop-blur-xl border border-white/40 rounded-[2.4rem] p-8 md:p-12 h-[340px] flex flex-col items-center justify-center relative overflow-hidden">
             <div className="scanline opacity-10" />
             
             {/* Security Grid Dots in device background */}
             <div className="absolute inset-0 bg-[radial-gradient(rgba(124,77,255,0.03)_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

             <AnimatePresence mode="wait">
               {demoStep === 0 && (
                 <motion.div key="step0" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-6">
                    <div className="flex items-center gap-3 bg-card/80 p-5 rounded-2xl border border-white/50 shadow-md animate-pulse max-w-md mx-auto">
                      <MessageSquare className="h-6 w-6 text-primary flex-shrink-0" />
                      <p className="text-xs font-semibold text-left text-foreground">Incoming SMS: "URGENT. SBI Primary Account blocked. Tap link below to verify identity..."</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                      <Cpu className="h-3.5 w-3.5 text-primary animate-spin" /> Neural Guard Routing Active
                    </div>
                 </motion.div>
               )}
               {demoStep === 1 && (
                 <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <Fingerprint className="h-20 w-20 text-primary animate-pulse" />
                      <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }} transition={{ repeat: Infinity, duration: 2.2 }} className="absolute inset-0 border-2 border-primary rounded-full" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">Decoding Verification Vectors...</p>
                 </motion.div>
               )}
               {demoStep === 2 && (
                 <motion.div key="step2" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-2xl shadow-lg shadow-destructive/5 max-w-sm mx-auto">
                      <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-2" />
                      <h3 className="text-xl font-black text-destructive uppercase tracking-widest">KYC PHISHING DETECTED</h3>
                    </div>
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">99.4% Impersonation Risk Probability</p>
                 </motion.div>
               )}
               {demoStep === 3 && (
                 <motion.div key="step3" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="p-6 bg-accent/15 border border-accent/20 rounded-2xl shadow-lg shadow-accent/5 max-w-sm mx-auto">
                      <CheckCircle className="h-10 w-10 text-accent mx-auto mb-2" />
                      <h3 className="text-xl font-black text-accent uppercase tracking-widest">MALICIOUS LINK DEFLECTED</h3>
                    </div>
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Threat quarantined in forensic vault</p>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* Luxury Features Grid */}
      <section className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 py-24 px-6 relative z-10">
        <FeatureCard 
          icon={<ImageIcon className="h-6 w-6" />} 
          title="X-Ray Scanner" 
          desc="Upload suspicious chats or banking screenshots. Nova highlights semantic inconsistencies, suspicious links, and credentials request templates."
          delay={0.1}
        />
        <FeatureCard 
          icon={<Mic className="h-6 w-6" />} 
          title="Voice Forensic" 
          desc="Detect synthesized audio, deepfake clones, and synthetic panic tactics. Evaluates voice vectors against known AI models."
          delay={0.2}
        />
        <FeatureCard 
          icon={<Zap className="h-6 w-6" />} 
          title="Regional Triage" 
          desc="Specifically tuned to Indian threat paradigms. High accuracy detecting local UPI scams, customs holds, and electricity disconnection fraud."
          delay={0.3}
        />
      </section>

      {/* Trust Badges */}
      <section className="max-w-6xl w-full border-t border-border/50 py-16 px-6 flex flex-wrap justify-center gap-16 opacity-50 relative z-10">
        <div className="flex items-center gap-2.5 font-bold text-[10px] tracking-[0.25em] text-foreground"><Lock className="h-4 w-4 text-primary" /> SECURE TRACE</div>
        <div className="flex items-center gap-2.5 font-bold text-[10px] tracking-[0.25em] text-foreground"><CheckCircle className="h-4 w-4 text-primary" /> GEMINI ENGINE</div>
        <div className="flex items-center gap-2.5 font-bold text-[10px] tracking-[0.25em] text-foreground"><Shield className="h-4 w-4 text-primary" /> FORENSIC GRADE</div>
      </section>

      <footer className="w-full text-center py-12 relative z-10 border-t border-border/20 bg-card/20">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] opacity-50">
          Shielding digital trust with real-time neural proofs.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass-card p-8 rounded-[2rem] space-y-6 border-white/40 shadow-sm relative group cursor-default"
    >
      <div className="absolute top-6 right-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
        <Fingerprint className="h-20 w-20 text-primary" />
      </div>
      <div className="p-3 w-fit rounded-xl bg-primary/10 text-primary shadow-sm">{icon}</div>
      <div className="space-y-3 relative z-10">
        <h3 className="text-xl font-black tracking-tight text-foreground uppercase">{title}</h3>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}
