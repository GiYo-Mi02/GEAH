"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame, defaultPlayerState } from '@/lib/gameState';
import { clearSession, getSavedSession } from '@/lib/api';
import { generateEpilogue } from '@/lib/claude';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

export default function EndingPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const [epilogue, setEpilogue] = useState<string | null>(null);
  const [isLoadingEpilogue, setIsLoadingEpilogue] = useState(true);
  
  const player = state.player || defaultPlayerState;

  // Generate dynamic epilogue via Puter.js
  useEffect(() => {
    const loadEpilogue = async () => {
      try {
        const session = await getSavedSession();
        if (session) {
          const historyEntries = session.history.map((h) => ({
            scene_id: '',
            choice_id: '',
            choice_label: h.choice_label,
            narrative_shown: h.narrative_shown,
            timestamp: h.timestamp,
          }));
          const text = await generateEpilogue(
            session.playerState || player,
            historyEntries
          );
          setEpilogue(text);
        } else {
          setEpilogue(
            `The tale of ${player.name} fades into the shadows, leaving only echoes of choices made in darkness.`
          );
        }
      } catch {
        setEpilogue(
          `The tale of ${player.name} fades into the shadows, leaving only echoes of choices made in darkness.`
        );
      } finally {
        setIsLoadingEpilogue(false);
      }
    };

    loadEpilogue();
  }, [player]);

  const handleRestart = async () => {
    // Clear saved session from puter.kv
    await clearSession();
    dispatch({ type: 'RESET_GAME' });
    router.push('/');
  };

  return (
    <main className="relative min-h-screen bg-[var(--color-brand-bg)] text-[#e0d8d0] overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="atmosphere transition-opacity duration-1000 opacity-60" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        className="relative z-10 max-w-2xl w-full text-center space-y-12 glass-panel p-10 md:p-16 rounded-3xl"
      >
        <div className="space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl tracking-widest uppercase font-light text-[var(--color-brand-accent)]">
            The End
          </h1>
          <p className="font-serif italic text-xl text-white/50">
            Thus concludes the tale of {player.name}.
          </p>
        </div>

        {/* Dynamic Epilogue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1.5 }}
          className="px-4 py-6 border-y border-white/10"
        >
          {isLoadingEpilogue ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-[var(--color-brand-accent)] animate-pulse font-bold">
                The Oracle reflects...
              </span>
              <div className="w-2 h-2 rounded-full bg-[var(--color-brand-accent)] animate-ping" />
            </div>
          ) : (
            <p className="font-serif italic text-lg text-white/70 leading-relaxed">
              {epilogue}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-3 gap-4 text-center my-12 border-y border-white/10 py-8">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 font-bold">Final Morality</div>
            <div className="font-serif text-3xl font-light text-[#4488ff]">{player.morality}</div>
          </div>
          <div>
             <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 font-bold">Final Reputation</div>
            <div className="font-serif text-3xl font-light text-[#ffaa00]">{player.reputation}</div>
          </div>
          <div>
             <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 font-bold">Remaining Health</div>
            <div className="font-serif text-3xl font-light text-[#ff4444]">{player.health}</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--color-brand-accent)] font-bold mb-4">Memories Acquired</h3>
          {player.key_events.length > 0 ? (
            <ul className="space-y-2 text-white/70 font-serif italic max-h-48 overflow-y-auto w-full max-w-sm mx-auto">
              {player.key_events.map((evt, i) => (
                <li key={i}>&quot;{evt}&quot;</li>
              ))}
            </ul>
          ) : (
             <p className="text-white/40 italic font-serif">No memories remain.</p>
          )}
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-center items-center gap-4">
          <Button variant="cinematic" onClick={handleRestart} className="px-8 min-w-[200px]">
             Play Again
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
