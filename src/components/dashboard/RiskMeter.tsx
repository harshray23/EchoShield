'use client';

import { motion } from 'framer-motion';

interface RiskMeterProps {
  score: number;
}

export function RiskMeter({ score }: RiskMeterProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate color based on risk score
  const color = score > 70 ? 'text-destructive' : 
                score > 40 ? 'text-orange-500' : 
                'text-accent';

  const glowClass = score > 70 ? 'drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 
                    score > 40 ? 'drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 
                    'drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]';

  return (
    <div className="relative h-56 w-56 flex items-center justify-center">
      <svg className="h-full w-full -rotate-90 filter drop-shadow-2xl">
        <circle
          cx="112"
          cy="112"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-white/5"
        />
        <motion.circle
          cx="112"
          cy="112"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: 2, ease: 'circOut' }}
          className={`${color} ${glowClass}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex flex-col items-center"
        >
          <span className={`font-black text-6xl tracking-tighter ${color}`}>{score}%</span>
          <span className="text-[10px] font-black text-muted-foreground tracking-[0.3em] uppercase">Risk Level</span>
        </motion.div>
      </div>
      
      {/* Decorative Outer Ring */}
      <div className="absolute inset-0 border border-white/5 rounded-full scale-[1.1]" />
      <div className="absolute inset-0 border border-dashed border-white/10 rounded-full scale-[1.2] opacity-30 animate-spin-slow" />
    </div>
  );
}
