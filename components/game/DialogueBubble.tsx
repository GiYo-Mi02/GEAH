"use client";

import React from 'react';
import { NarrativeBox } from './NarrativeBox';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface DialogueBubbleProps {
  text: string;
  mode: 'narration' | 'dialogue';
  speakerName?: string;
  onComplete?: () => void;
}

export const DialogueBubble: React.FC<DialogueBubbleProps> = ({ 
  text, 
  mode, 
  speakerName, 
  onComplete 
}) => {
  if (mode === 'narration') {
    return (
      <div className="w-full relative">
        <NarrativeBox 
          text={text} 
          onComplete={onComplete}
          className="text-center italic text-white/70"
        />
      </div>
    );
  }

  // Dialogue mode
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="relative w-full max-w-3xl ml-auto md:ml-24"
    >
      <div className="glass-panel p-6 md:p-8 rounded-2xl rounded-tl-sm border border-white/20 shadow-xl relative">
        {/* Tail point pointing to character portrait on left */}
        <div className="absolute top-0 -left-3 w-6 h-6 overflow-hidden">
          <div className="w-6 h-6 bg-[var(--color-glass-surface)] border border-white/20 rotate-45 transform origin-top-right -translate-y-1/2 translate-x-1/2 shadow-xl backdrop-blur-md" />
        </div>

        {speakerName && (
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--color-brand-accent)] mb-3">
            {speakerName}
          </div>
        )}

        <NarrativeBox 
          text={text} 
          onComplete={onComplete}
        />
      </div>
    </motion.div>
  );
};
