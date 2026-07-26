'use client';

import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Globe, Users, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  const values = [
    { icon: <Lock className="h-6 w-6" />, title: "Privacy First", desc: "Your data is analyzed in real-time and never sold to third parties." },
    { icon: <Shield className="h-6 w-6" />, title: "Total Protection", desc: "Defense against the most sophisticated AI-driven social engineering." },
    { icon: <Globe className="h-6 w-6" />, title: "Global Intelligence", desc: "Powered by Gemini to stay ahead of international scam networks." }
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-16">
      <section className="text-center space-y-6 pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block p-2 rounded-[2rem] bg-primary/5 border border-primary/10 mb-4"
        >
          <img src="/logo.jpg" alt="EchoShield AI Logo" className="h-32 w-32 object-contain rounded-[1.8rem] shadow-sm" />
        </motion.div>
        <h1 className="text-5xl font-black tracking-tight">Our Mission</h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
          In an era where AI can mimic any voice and fake any document, EchoShield AI exists to provide a digital armor for the vulnerable.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {values.map((v, i) => (
          <Card key={i} className="glass-card border-white/5 rounded-[2rem] p-4 text-center">
            <CardContent className="pt-8 space-y-4">
              <div className="mx-auto w-fit p-4 bg-primary/10 rounded-2xl text-primary">{v.icon}</div>
              <h3 className="text-xl font-bold">{v.title}</h3>
              <p className="text-sm text-muted-foreground font-medium">{v.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="glass-card rounded-[3rem] p-12 border-white/5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h2 className="text-3xl font-black">Powered by Gemini</h2>
            <p className="text-muted-foreground font-medium leading-relaxed">
              We leverage Google's most advanced multimodal models to understand the nuance of human manipulation. By analyzing screenshots, audio, and text simultaneously, we provide a level of forensic accuracy previously unavailable to individual users.
            </p>
          </div>
          <div className="w-full md:w-1/3 flex justify-center">
             <div className="h-48 w-48 rounded-full bg-gradient-to-br from-primary to-accent opacity-20 blur-3xl absolute" />
             <Globe className="h-32 w-32 text-primary relative z-10 animate-pulse" />
          </div>
        </div>
      </section>
    </div>
  );
}
