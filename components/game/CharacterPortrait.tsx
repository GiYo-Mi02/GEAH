"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export type Emotion = 'calm' | 'tense' | 'danger' | 'neutral';

interface CharacterPortraitProps {
  name: string;
  emotion: Emotion;
}

const EMOTION_COLORS: Record<Emotion, string> = {
  calm: 'rgba(68, 136, 255, 0.4)',  // blue
  tense: 'rgba(255, 170, 0, 0.4)',  // orange
  danger: 'rgba(255, 68, 68, 0.4)', // red
  neutral: 'rgba(255, 255, 255, 0.1)' // faint white
};

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({ name, emotion }) => {
  return (
    <div className="hidden md:flex flex-col items-center justify-end absolute -left-20 bottom-0 pointer-events-none select-none z-10">
      
      {/* Name Label */}
      <div className="absolute -bottom-8 flex flex-col items-center justify-center alpha-glow">
        <span className="font-serif text-sm uppercase tracking-[0.3em] text-white/70 shadow-black drop-shadow-md">
          {name}
        </span>
        <div className="w-8 h-px bg-white/20 mt-1" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={name + emotion}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative flex items-center justify-center"
        >
          {/* Radial Glow based on Emotion */}
          <div 
            className="absolute inset-0 rounded-full blur-[60px] transition-colors duration-1000 -z-10 w-[250px] h-[300px]"
            style={{ background: `radial-gradient(circle, ${EMOTION_COLORS[emotion]} 0%, transparent 70%)` }}
          />

          {/* Silhouette Figure with breathing animation */}
          <motion.div
            animate={{ scale: [1, 1.015, 1], y: [0, -2, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-48 h-64 flex items-end justify-center"
          >
            <svg 
              viewBox="0 0 200 300" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-black drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] filter opacity-95"
            >
              {/* Cloaked/hooded figure silhouette */}
              <path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M100 20C120 20 135 35 140 55C145 75 142 100 135 120C150 140 165 170 175 220C185 270 190 300 190 300H10C10 300 15 270 25 220C35 170 50 140 65 120C58 100 55 75 60 55C65 35 80 20 100 20Z" 
                fill="#050302"
              />
              <path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M100 22C118 22 132 36 136 55C141 74 138 98 132 118C146 138 160 168 170 216C178 256 182 284 184 298H16C18 284 22 256 30 216C40 168 54 138 68 118C62 98 59 74 64 55C68 36 82 22 100 22Z" 
                fill="#000000"
              />
              {/* Subtle rim light indicator */}
              <path 
                d="M100 22C118 22 132 36 136 55C141 74 138 98 132 118" 
                stroke="white" 
                strokeWidth="1" 
                strokeOpacity="0.1"
              />
            </svg>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
