"use client";

import React, { useState } from 'react';
import { useGame } from '@/lib/gameState';
import { StatBar } from '@/components/ui/StatBar';
import { motion, AnimatePresence } from 'motion/react';
import { Package, X, Compass } from 'lucide-react';
import { AudioToggle } from '@/components/ui/AudioToggle';

export const PlayerDashboard: React.FC = () => {
  const { state } = useGame();
  const player = state.player;
  const [showInventory, setShowInventory] = useState(false);

  if (!player) return null;

  return (
    <>
      <header className="relative w-full p-4 md:p-8 flex flex-col md:flex-row md:justify-between items-start md:items-center z-40 gap-4">
        {/* Stats */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 pointer-events-auto">
          <StatBar label="Health" value={player.health || 0} colorClass="bg-[#ff4444]" />
          <StatBar label="Morality" value={player.morality || 0} colorClass="bg-[#4488ff]" />
          <StatBar label="Reputation" value={player.reputation || 0} colorClass="bg-[#ffaa00]" />
        </div>

        {/* Info & Toggles */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="text-right hidden sm:block mr-2">
            {state.currentScene && (
              <>
                <div className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-brand-accent)] font-bold mb-1">
                  Act {state.currentScene.act} • {state.currentScene.title}
                </div>
                <div className="text-xs opacity-40">Scene {state.currentScene.scene}</div>
              </>
            )}
          </div>
          
          <AudioToggle />
          
          <div className="relative group">
            <button className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md cursor-not-allowed">
              <Compass className="w-5 h-5 text-white/40" />
            </button>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-[10px] uppercase tracking-widest text-[#ffaa00] px-3 py-1 rounded whitespace-nowrap pointer-events-none">
              Coming Soon
            </div>
          </div>
          
          <button
            onClick={() => setShowInventory(true)}
            className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md"
          >
            <Package className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </header>

      {/* Inventory Drawer */}
      <AnimatePresence>
        {showInventory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInventory(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-neutral-950 border-l border-white/10 z-50 p-6 flex flex-col shadow-2xl pointer-events-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-serif text-xl tracking-widest uppercase">Inventory</h2>
                <button onClick={() => setShowInventory(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2">
                {player.inventory.length === 0 ? (
                  <p className="text-white/40 italic font-serif text-sm">Your pockets are empty.</p>
                ) : (
                  player.inventory.map((item, i) => (
                    <div key={i} className="p-3 border border-white/5 rounded-md bg-white/5">
                      <span className="font-serif text-white/80">{item}</span>
                    </div>
                  ))
                )}
              </div>
              
              {player.key_events.length > 0 && (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <h3 className="font-mono text-xs text-white/40 mb-4 uppercase tracking-wider">Memories</h3>
                  <ul className="space-y-2">
                    {player.key_events.map((evt, i) => (
                      <li key={i} className="text-sm font-serif text-white/60 italic">&#8226; {evt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
