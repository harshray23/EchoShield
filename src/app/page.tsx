'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, MessageSquare, Mic, Image as ImageIcon, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-6xl w-full text-center space-y-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 cyber-glow">
              <Shield className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-7xl font-black tracking-tighter sm:text-8xl neon-text mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            EchoShield AI
          </h1>
          <p className="text-3xl font-bold text-primary/90 tracking-tight">
            Hear the Truth Before You Trust.
          </p>
          <p className="max-w-3xl mx-auto text-xl text-muted-foreground font-medium leading-relaxed">
            Advanced AI protection against deepfakes, phishing, and social engineering. 
            Analyze screenshots, voice, and chats instantly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10"
        >
          <Button size="lg" className="h-16 px-12 text-xl btn-gradient cyber-glow rounded-2xl" asChild>
            <Link href="/dashboard">
              Analyze Now <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-16 px-12 text-xl border-primary/30 rounded-2xl bg-white/5 hover:bg-white/10" asChild>
            <Link href="/learn">Safety Academy</Link>
          </Button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 py-24">
        <FeatureCard 
          icon={<ImageIcon className="h-10 w-10" />} 
          title="Screenshot Scanner" 
          desc="Upload banking chats or emails. Gemini identifies urgent language and phishing patterns."
          delay={0.2}
        />
        <FeatureCard 
          icon={<Mic className="h-10 w-10" />} 
          title="Voice Analyzer" 
          desc="Detect AI-generated deepfake voices and high-pressure emotional manipulation."
          delay={0.4}
        />
        <FeatureCard 
          icon={<MessageSquare className="h-10 w-10" />} 
          title="Chat Analyzer" 
          desc="Paste messages from WhatsApp or Telegram to get an instant safety rating."
          delay={0.6}
        />
      </section>

      {/* Trust Badges */}
      <section className="max-w-6xl w-full border-t border-white/5 py-12 flex flex-wrap justify-center gap-12 opacity-50">
        <div className="flex items-center gap-2 font-bold text-sm tracking-widest"><Lock className="h-4 w-4" /> SECURE ENCRYPTION</div>
        <div className="flex items-center gap-2 font-bold text-sm tracking-widest"><CheckCircle className="h-4 w-4" /> GEMINI POWERED</div>
        <div className="flex items-center gap-2 font-bold text-sm tracking-widest"><AlertTriangle className="h-4 w-4" /> ZERO TRUST POLICY</div>
      </section>

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
      className="glass-card p-10 rounded-3xl space-y-6 border-white/5 hover:border-primary/30 transition-all cursor-default"
    >
      <div className="p-3 w-fit rounded-2xl bg-primary/10 text-primary">{icon}</div>
      <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}