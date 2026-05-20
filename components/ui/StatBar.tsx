import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useAnimation } from 'motion/react';

interface StatBarProps {
  label: string;
  value: number; // 0 to 100
  colorClass: string;
  className?: string;
}

export const StatBar: React.FC<StatBarProps> = ({ label, value, colorClass, className }) => {
  const isCritical = value <= 30 && label.toLowerCase() === 'health';
  const prevValueRef = useRef(value);
  const flashControls = useAnimation();

  useEffect(() => {
    if (label.toLowerCase() === 'morality' && value !== prevValueRef.current) {
      flashControls.start({
        backgroundColor: ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)'],
        transition: { duration: 0.5 }
      });
    }
    prevValueRef.current = value;
  }, [value, label, flashControls]);

  return (
    <div className={cn("w-48 group relative", className)}>
      <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] mb-1 opacity-60 font-bold">
        <span>{label}</span>
        {/* Hidden normally, fades in on hover over container */}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">{value}%</span>
      </div>
      <motion.div 
        animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
        transition={isCritical ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } : {}}
        className="h-1 w-full bg-white/10 rounded-full overflow-visible relative"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn("h-full stat-bar-fill relative", colorClass)}
        >
          {/* Flash overlay element */}
          <motion.div 
            animate={flashControls}
            className="absolute inset-0 bg-white/0" 
          />
        </motion.div>
      </motion.div>
    </div>
  );
};
