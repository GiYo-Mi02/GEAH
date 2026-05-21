"use client";

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';

export type Emotion = 'calm' | 'tense' | 'danger' | 'neutral';

interface CharacterPortraitProps {
  name: string;
  emotion: Emotion;
}

const ORACLE_PORTRAITS: Record<Emotion, string> = {
  calm: '/oracle-calm.png',
  tense: '/oracle.png',
  danger: '/oracle-danger.png',
  neutral: '/oracle.png',
};

const SPEAKER_PORTRAITS: Record<string, string> = {
  knight: '/knight.png',
  tobias: '/tobias.png',
  eldritch: '/eldritch.png',
};

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({ name, emotion }) => {
  const normalizedName = name.trim().toLowerCase();
  const speakerKey = normalizedName.replace(/^the\s+/, '');
  const portraitSrc =
    speakerKey === 'oracle'
      ? ORACLE_PORTRAITS[emotion]
      : SPEAKER_PORTRAITS[speakerKey] || '/oracle.png';

  return (
    <div className="absolute left-[8vw] bottom-0 pointer-events-none select-none z-10 flex items-end justify-center h-[80vh] w-[34vw] max-w-[520px] origin-bottom-left">
      
      {/* Name Label */}
      <div className="absolute -bottom-8 flex flex-col items-center justify-center alpha-glow">
        <span className="font-serif text-xs md:text-sm uppercase tracking-[0.35em] text-white/70 shadow-black drop-shadow-md">
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
          className="relative flex items-center justify-center h-full w-full"
        >
          {/* Radial Glow based on Emotion */}
          <div 
            className="absolute inset-0 rounded-full blur-[90px] transition-colors duration-1000 -z-10"
            style={{ background: 'radial-gradient(circle, rgba(180,100,20,0.15) 0%, transparent 70%)' }}
          />

          {/* Silhouette Figure with breathing animation */}
          <motion.div
            animate={{ scale: [1, 1.015, 1], y: [0, -2, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative h-full w-full flex items-end justify-center"
          >
            <Image
              src={portraitSrc}
              alt={name}
              fill
              sizes="(max-width: 768px) 45vh, 50vh"
              priority
              className="object-contain drop-shadow-[0_0_22px_rgba(0,0,0,0.85)]"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
