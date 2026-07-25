'use client';

import { motion } from 'framer-motion';

interface RiskMeterProps {
  score: number;
}

export function RiskMeter({ score }: RiskMeterProps) {
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const color = score > 70 ? 'text-destructive' : score > 40 ? 'text-orange-500' : 'text-accent';

  return (
    <div className="relative h-48 w-48 mx-auto md:mx-0">
      <svg className="h-48 w-48 -rotate-90">
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="16"
          fill="transparent"
          className="text-white/5"
        />
        <motion.circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="16"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className={color}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-5xl tracking-tighter">{score}%</span>
        <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Risk Index</span>
      </div>
    </div>
  );
}
