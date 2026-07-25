
"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, MessageSquare, Mic, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-6xl w-full text-center space-y-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 cyber-glow">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-6xl font-extrabold tracking-tighter sm:text-7xl neon-text mb-4">
            EchoShield AI
          </h1>
          <p className="text-2xl font-medium text-primary/80 mb-6">
            Hear the Truth Before You Trust.
          </p>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Protect yourself against AI scams, phishing attacks, fake job offers, OTP fraud, impersonation, and deepfake voice scams.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
        >
          <Button size="lg" className="h-14 px-10 text-lg cyber-glow" asChild>
            <Link href="/dashboard">Analyze Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-primary/30" asChild>
            <Link href="/learn">Safety Academy</Link>
          </Button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 py-20">
        <FeatureCard 
          icon={<ImageIcon className="h-8 w-8" />} 
          title="Screenshot Scanner" 
          desc="Upload chats or emails. Gemini extracts text and identifies manipulation."
        />
        <FeatureCard 
          icon={<Mic className="h-8 w-8" />} 
          title="Voice Analyzer" 
          desc="Detect emotional triggers and AI-generated voice scams with high precision."
        />
        <FeatureCard 
          icon={<MessageSquare className="h-8 w-8" />} 
          title="Chat Analyzer" 
          desc="Paste WhatsApp or Telegram conversations to get an instant scam score."
        />
      </section>

      {/* Footer Decoration */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="glass-card p-8 rounded-2xl space-y-4"
    >
      <div className="text-primary">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{desc}</p>
    </motion.div>
  );
}
