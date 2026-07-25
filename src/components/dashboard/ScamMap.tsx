
'use client';

import { motion } from 'framer-motion';
import { Globe, MapPin, Activity } from 'lucide-react';

const SCAM_HOTSPOTS = [
  { region: 'Maharashtra', scam: 'UPI Refund Fraud', risk: 'Severe' },
  { region: 'Delhi NCR', scam: 'Electricity Bill Fraud', risk: 'High' },
  { region: 'Karnataka', scam: 'Job Internship Fraud', risk: 'Critical' },
  { region: 'West Bengal', scam: 'Courier Customs Fraud', risk: 'High' },
  { region: 'Tamil Nadu', scam: 'Bank KYC Scam', risk: 'Severe' },
];

export function ScamMap() {
  return (
    <div className="relative h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-2 text-accent font-black uppercase text-[10px] tracking-widest">
            <Globe className="h-4 w-4" /> Live Threat Heatmap
         </div>
         <div className="flex items-center gap-1">
           <div className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
           <span className="text-[8px] font-black text-red-600 uppercase">Live Detection</span>
         </div>
      </div>

      <div className="flex-1 relative bg-white/5 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center group">
        {/* Mock Map visualization */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/seed/map/600/400')] bg-cover bg-center grayscale contrast-200" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        <div className="relative z-10 space-y-4 w-full px-6">
          {SCAM_HOTSPOTS.map((spot, i) => (
            <motion.div 
              key={spot.region}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 hover:border-primary/30 transition-all cursor-default"
            >
              <div className="flex items-center gap-3">
                <MapPin className={`h-3 w-3 ${spot.risk === 'Critical' ? 'text-red-600' : 'text-primary'}`} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white">{spot.region}</span>
                  <span className="text-[8px] font-bold text-muted-foreground">{spot.scam}</span>
                </div>
              </div>
              <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${
                spot.risk === 'Critical' ? 'bg-red-600/20 text-red-600' : 
                spot.risk === 'Severe' ? 'bg-orange-600/20 text-orange-600' : 'bg-primary/20 text-primary'
              }`}>
                {spot.risk}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-accent/5 border border-accent/10 rounded-xl flex items-center gap-3">
        <Activity className="h-4 w-4 text-accent animate-pulse" />
        <p className="text-[9px] font-bold text-accent uppercase leading-tight">
          Trending: RBI KYC scams reported in 12+ regions today.
        </p>
      </div>
    </div>
  );
}
