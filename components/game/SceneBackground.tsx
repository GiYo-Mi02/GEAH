"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SceneBackgroundProps {
  act: number;
  scene: number;
}

const ACT_BACKGROUNDS: Record<number, string> = {
  1: 'https://picsum.photos/id/1011/1920/1080', // dark forest / nature
  2: 'https://picsum.photos/id/1040/1920/1080', // ruined castle / architecture
  3: 'https://picsum.photos/id/1043/1920/1080', // abyss / dark
};

// Deterministic array for particles to avoid Math.random during render
const SCENE_PARTICLES = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  xStart: (i * 137.5) % 100,
  yStart: 50 + ((i * 93.1) % 50),
  scale: 0.5 + ((i * 11) % 50) / 100,
  duration: 15 + ((i * 17) % 20),
  delay: (i * 3) % 10,
  drift: (i % 2 === 0 ? 5 : -5),
}));

export const SceneBackground: React.FC<SceneBackgroundProps> = ({ act }) => {
  const bgImage = ACT_BACKGROUNDS[act] || ACT_BACKGROUNDS[1];

  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={bgImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'linear' }}
          className="absolute inset-0"
        >
          {/* Layer 1: Static Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Layer 2: Parallax/Drifting Fog Overlay */}
      <div 
        className="absolute w-[200%] h-full bottom-0 left-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"
        style={{
          background: 'radial-gradient(ellipse at bottom, rgba(30, 20, 20, 0.4) 0%, transparent 60%)',
          animation: 'drift 40s linear infinite alternate',
        }}
      />
      <style>{`
        @keyframes drift {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Layer 3: Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_#0a0502_90%)]" />

      {/* Layer 4: Particles */}
      <div className="absolute inset-0 overflow-hidden mix-blend-screen opacity-50">
        {SCENE_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            initial={{ 
              x: `${p.xStart}vw`, 
              y: `${p.yStart}vh`, 
              opacity: 0,
              scale: p.scale
            }}
            animate={{ 
              y: '-10vh', 
              opacity: [0, 0.8, 0],
              x: `${p.xStart + p.drift}vw` 
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute w-1 h-1 rounded-full bg-orange-500 blur-[1px]"
            style={{
              boxShadow: '0 0 10px 2px rgba(255, 78, 0, 0.4)'
            }}
          />
        ))}
      </div>
    </div>
  );
};
