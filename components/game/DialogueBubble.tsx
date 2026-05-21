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
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 120 }}
      className="relative w-full z-20"
    >
      <div className="relative bg-[rgba(15,8,4,0.88)] p-6 rounded-[12px] border border-[rgba(180,130,60,0.4)] shadow-2xl">
        {speakerName && (
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] font-bold text-amber-200/80 mb-3">
            {speakerName}
          </div>
        )}

        <div className="max-h-[28vh] overflow-y-auto pr-2 vn-scroll">
          <NarrativeBox 
            text={text} 
            onComplete={onComplete}
            className="text-[1.1rem] leading-[1.7] text-[#efe7dd] italic"
          />
        </div>
      </div>
    </motion.div>
  );
};
