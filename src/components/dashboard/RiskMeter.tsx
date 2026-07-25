
'use client';

import { motion } from 'framer-motion';

interface RiskMeterProps {
  score: number;
}

export function RiskMeter({ score }: RiskMeterProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  const getRiskConfig = (s: number) => {
    if (s <= 20) return { label: 'Safe', color: 'text-accent', shadow: 'rgba(34,197,94,0.5)' };
    if (s <= 40) return { label: 'Low', color: 'text-accent/80', shadow: 'rgba(34,197,94,0.3)' };
    if (s <= 60) return { label: 'Moderate', color: 'text-yellow-500', shadow: 'rgba(234,179,8,0.5)' };
    if (s <= 80) return { label: 'High', color: 'text-orange-500', shadow: 'rgba(249,115,22,0.5)' };
    return { label: 'Critical', color: 'text-destructive', shadow: 'rgba(239,68,68,0.5)' };
  };

  const config = getRiskConfig(score);

  return (
    <div 
      className="relative h-64 w-64 flex items-center justify-center"
      role="img"
      aria-label={`Forensic Cyber Heat Meter: ${score}% Risk - ${config.label}`}
    >
      {/* Background Glow */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className={`absolute inset-0 rounded-full blur-3xl ${config.color.replace('text-', 'bg-')}`}
        aria-hidden="true"
      />

      <svg 
        className="h-full w-full -rotate-90 filter drop-shadow-2xl relative z-10"
        viewBox="0 0 256 256"
        aria-hidden="true"
      >
        <circle
          cx="128"
          cy="128"
          r={radius}
          stroke="currentColor"
          strokeWidth="14"
          fill="transparent"
          className="text-white/5"
        />
        <motion.circle
          cx="128"
          cy="128"
          r={radius}
          stroke="currentColor"
          strokeWidth="14"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: 2, ease: 'circOut' }}
          className={`${config.color}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 10px ${config.shadow})` }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col items-center"
        >
          <span className={`font-black text-6xl tracking-tighter leading-none ${config.color}`}>
            {score}%
          </span>
          <div className="flex flex-col items-center -mt-1">
            <span className={`text-[12px] font-black tracking-[0.3em] uppercase ${config.label === 'Safe' ? 'text-accent' : config.color}`}>
              {config.label}
            </span>
            <span className="text-[8px] font-black text-muted-foreground tracking-[0.4em] uppercase opacity-50">
              Cyber Heat Level
            </span>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative Outer Ring */}
      <div className="absolute inset-0 border border-white/5 rounded-full scale-[1.05]" aria-hidden="true" />
      <div className="absolute inset-0 border border-dashed border-white/10 rounded-full scale-[1.15] opacity-20 animate-[spin_20s_linear_infinite]" aria-hidden="true" />
    </div>
  );
}
