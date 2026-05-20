"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGame, defaultPlayerState } from '@/lib/gameState';
import { setPlayerName, hasSavedSession, clearSession } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

// Deterministic array for particles to avoid Math.random during render
const PARTICLES = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  x: (i * 137.5) % 100, // Golden angle approximation for pseudo-random distribution
  y: (i * 93.1) % 100,
  scale: 0.5 + ((i * 11) % 50) / 100,
  duration: 10 + ((i * 17) % 10),
  delay: (i * 3) % 5,
}));

export default function LandingPage() {
  const [name, setName] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const { dispatch } = useGame();
  const router = useRouter();

  // Mouse parallax tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 400 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const bgX = useTransform(smoothX, [-0.5, 0.5], ['-1%', '1%']);
  const bgY = useTransform(smoothY, [-0.5, 0.5], ['-1%', '1%']);

  // Check if Puter.js is loaded and if there's a saved session
  const checkPuterAndSession = useCallback(async () => {
    if (typeof window !== 'undefined' && window.puter) {
      setPuterReady(true);
      try {
        const saved = await hasSavedSession();
        setHasSaved(saved);
      } catch {
        // Puter.kv not available yet — that's fine
      }
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Check for saved session after Puter.js loads
    // Puter.js may take a moment to initialize
    const checkInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.puter) {
        checkPuterAndSession();
        clearInterval(checkInterval);
      }
    }, 200);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(checkInterval);
    };
  }, [mouseX, mouseY, checkPuterAndSession]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);
    
    const playerName = name.trim() || 'Wanderer';

    // Clear any existing saved session for a fresh start
    if (puterReady) {
      await clearSession();
    }

    // Persist player name for the API layer
    setPlayerName(playerName);

    // Initialize player state
    dispatch({
      type: 'SET_PLAYER',
      payload: {
        ...defaultPlayerState,
        name: playerName,
      }
    });

    // Start transition
    setTimeout(() => {
      router.push('/game');
    }, 1500);
  };

  const handleContinue = async () => {
    setIsStarting(true);

    // Load saved session — game/page.tsx will pick it up from puter.kv via fetchScene('start')
    setTimeout(() => {
      router.push('/game');
    }, 1500);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--color-brand-bg)] text-[#e0d8d0] font-sans">
      <motion.div 
        className="absolute inset-[-5%] w-[110%] h-[110%] z-0"
        style={{ x: bgX, y: bgY }}
      >
        {/* Abstract mist/mountain layers using SVG and CSS */}
        <div className="absolute inset-0 bg-[url('https://picsum.photos/id/1033/1920/1080')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute w-full h-[60%] bottom-0 bg-gradient-to-t from-[#0a0502] via-[#0a0502]/80 to-transparent" />
        
        {/* Atmosphere blob */}
        <div className="atmosphere transition-opacity duration-1000 opacity-60" />

        {/* Floating particles */}
        <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-1 h-1 rounded-full bg-orange-500/50"
              initial={{
                x: `${p.x}vw`,
                y: `${p.y}vh`,
                scale: p.scale
              }}
              animate={{
                y: '-10vh',
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isStarting ? 0 : 1, scale: isStarting ? 1.05 : 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="relative z-10 flex flex-col items-center justify-center p-8 max-w-lg w-full text-center glass-panel rounded-3xl"
      >
        <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--color-brand-accent)] mb-6 font-bold">Act 0 • Genesis</span>
        
        <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight mb-4 drop-shadow-2xl text-[#e0d8d0]">
          Shadows of the <br />
          <span className="italic text-white/50">Abyss</span>
        </h1>
        
        <div className="font-serif text-sm italic text-white/30 tracking-widest mt-2 mb-6">
          &quot;The darkness is not an end, but a beginning.&quot;
        </div>

        <div className="h-px w-24 bg-gradient-to-r from-transparent via-[var(--color-brand-accent)] to-transparent my-4 opacity-50" />
        
        <form onSubmit={handleStart} className="flex flex-col w-full max-w-sm gap-6 mt-4">
          <input
            type="text"
            placeholder="Enter your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isStarting}
            className="w-full bg-black/40 border-b border-white/20 text-center font-serif text-xl p-3 text-[#e0d8d0] placeholder:text-white/20 focus:outline-none focus:border-[var(--color-brand-accent)] transition-colors disabled:opacity-50 tracking-wider"
          />
          
          <div className="relative mt-4 group">
            {/* Pulse effect under button */}
            <div className="absolute inset-0 bg-orange-600 rounded-md blur-md opacity-20 group-hover:opacity-40 animate-pulse transition-opacity duration-1000" />
            <Button 
              type="submit" 
              variant="cinematic"
              size="lg"
              className="w-full relative"
              disabled={isStarting}
            >
              {isStarting ? 'Entering the dark...' : 'Begin Journey'}
            </Button>
          </div>

          {/* Continue saved game button */}
          {hasSaved && !isStarting && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <button
                type="button"
                onClick={handleContinue}
                className="w-full text-center text-sm font-mono tracking-widest uppercase text-[var(--color-brand-accent)]/60 hover:text-[var(--color-brand-accent)] transition-colors duration-300 py-2"
              >
                ↳ Continue Saved Journey
              </button>
            </motion.div>
          )}
        </form>
      </motion.div>
    </main>
  );
}
