"use client";

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SceneTransitionProps {
  isTransitioning: boolean;
  label: string;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({ isTransitioning, label }) => {
  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="font-serif text-2xl md:text-4xl text-white/80 tracking-widest uppercase font-light">
              {label.split('·')[0]}
            </div>
            {label.includes('·') && (
              <div className="h-px w-12 bg-white/20 my-4" />
            )}
            {label.includes('·') && (
              <div className="font-mono text-xs text-[var(--color-brand-accent)] tracking-[0.4em] uppercase">
                {label.split('·')[1]}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
