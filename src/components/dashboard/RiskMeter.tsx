'use client';

import { motion } from 'framer-motion';

interface RiskMeterProps {
  score: number;
}

export function RiskMeter({ score }: RiskMeterProps) {
  const radius = 90; // Increased size
  const circumference = 2 * Math.PI * radius;
  
  const getRiskConfig = (s: number) => {
    if (s <= 20) return { label: 'Safe', color: 'text-accent', shadow: 'rgba(34,197,94,0.6)', glow: 'shadow-accent/40' };
    if (s <= 40) return { label: 'Low', color: 'text-accent/80', shadow: 'rgba(34,197,94,0.4)', glow: 'shadow-accent/20' };
    if (s <= 60) return { label: 'Moderate', color: 'text-yellow-500', shadow: 'rgba(234,179,8,0.6)', glow: 'shadow-yellow-500/40' };
    if (s <= 80) return { label: 'High', color: 'text-orange-500', shadow: 'rgba(249,115,22,0.6)', glow: 'shadow-orange-500/40' };
    return { label: 'Critical', color: 'text-destructive', shadow: 'rgba(239,68,68,0.7)', glow: 'shadow-destructive/60' };
  };

  const config = getRiskConfig(score);

  return (
    <div 
      className="relative h-72 w-72 flex items-center justify-center"
      role="img"
      aria-label={`Cyber Heat Meter: ${score}% Risk - ${config.label}`}
    >
      {/* Background Pulse Glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.1, 0.25, 0.1], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-0 rounded-full blur-[60px] ${config.color.replace('text-', 'bg-')}`}
        aria-hidden="true"
      />

      <svg 
        className="h-full w-full -rotate-90 filter drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] relative z-10"
        viewBox="0 0 256 256"
        aria-hidden="true"
      >
        <circle
          cx="128"
          cy="128"
          r={radius}
          stroke="currentColor"
          strokeWidth="18"
          fill="transparent"
          className="text-white/5"
        />
        <motion.circle
          cx="128"
          cy="128"
          r={radius}
          stroke="currentColor"
          strokeWidth="18"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className={`${config.color}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 15px ${config.shadow})` }}
        />
        
        {/* Animated Scanning Dots */}
        <motion.circle
          cx="128"
          cy="128"
          r={radius + 15}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
          fill="transparent"
          strokeDasharray="4 20"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col items-center"
        >
          <span className={`font-black text-7xl tracking-tighter leading-none mb-2 ${config.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`}>
            {score}%
          </span>
          <div className="flex flex-col items-center">
            <motion.span 
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`text-[14px] font-black tracking-[0.4em] uppercase ${config.label === 'Safe' ? 'text-accent' : config.color}`}
            >
              {config.label}
            </motion.span>
            <span className="text-[9px] font-black text-white/30 tracking-[0.5em] uppercase mt-1">
              CYBER HEAT LVL
            </span>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative Forensic Rings */}
      <div className="absolute inset-0 border border-white/5 rounded-full scale-[1.08]" aria-hidden="true" />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border border-dashed border-white/10 rounded-full scale-[1.2] opacity-30" 
        aria-hidden="true" 
      />
      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}
