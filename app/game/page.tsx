"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame, defaultPlayerState } from '@/lib/gameState';
import { fetchScene, makeChoice } from '@/lib/api';
import { PlayerDashboard } from '@/components/game/PlayerDashboard';
import { DialogueBubble } from '@/components/game/DialogueBubble';
import { ChoicePanel } from '@/components/game/ChoicePanel';
import { SceneBackground } from '@/components/game/SceneBackground';
import { SceneTransition } from '@/components/game/SceneTransition';
import { CharacterPortrait } from '@/components/game/CharacterPortrait';
import { motion, AnimatePresence } from 'motion/react';

export default function GamePage() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const [narrativeComplete, setNarrativeComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // If no player state exists, either we came here directly or refreshed.
    // Init with defaults and load first scene.
    if (!state.player) {
      dispatch({ type: 'SET_PLAYER', payload: defaultPlayerState });
    }

    const loadStartScene = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const initialScene = await fetchScene('start');
        dispatch({ type: 'SET_SCENE', payload: initialScene });
      } catch (err) {
        console.error('Failed to load scene:', err);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    if (!state.currentScene && state.history.length === 0) {
      loadStartScene();
    }
  }, [dispatch, state.currentScene, state.history.length, state.player]);

  const handleChoiceSelect = async (choiceId: string) => {
    if (!state.currentScene || !state.player) return;

    setIsTransitioning(true);
    setNarrativeComplete(false); // Reset for next scene
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const { nextSceneId, updatedState } = await makeChoice(
        state.currentScene.id, 
        choiceId, 
        state.player
      );

      // Game over: redirect to ending
      if (nextSceneId === 'game_over') {
        dispatch({ type: 'UPDATE_PLAYER', payload: updatedState });
        setTimeout(() => router.push('/ending'), 2000);
        return;
      }

      const nextScene = await fetchScene(nextSceneId);
      
      dispatch({ type: 'UPDATE_PLAYER', payload: updatedState });
      dispatch({ type: 'SET_SCENE', payload: nextScene });
      
      // Also check if the scene has no choices (alternative game-over signal)
      if (nextScene.choices.length === 0) {
         setTimeout(() => router.push('/ending'), 3000);
      }
    } catch (err) {
      console.error('Choice failed:', err);
    } finally {
      setIsTransitioning(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const currentScene = state.currentScene;

  return (
    <main className="relative min-h-screen bg-transparent text-[#e0d8d0] overflow-hidden flex flex-col font-sans">
      <SceneTransition 
        isTransitioning={isTransitioning} 
        label={currentScene ? `Act ${currentScene.act} · ${currentScene.title}` : ''} 
      />
      
      {currentScene && (
        <SceneBackground background={currentScene.background} />
      )}

      {currentScene && (
        <CharacterPortrait name={currentScene.speaker || 'The Oracle'} emotion={currentScene.emotion || 'neutral'} />
      )}
      
      <div className="relative z-10 h-full w-full flex flex-col flex-1 p-4 md:p-8">
        <PlayerDashboard />

        <div className="flex-1 flex flex-col w-full max-w-[1280px] mx-auto justify-end">
          <AnimatePresence mode="wait">
            {state.isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, filter: 'blur(10px)' }}
                className="flex flex-col items-center justify-center gap-4 py-20"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--color-brand-accent)] animate-pulse font-bold">The Oracle is weaving...</span>
                  <div className="w-2 h-2 rounded-full bg-[var(--color-brand-accent)] animate-ping"></div>
                </div>
              </motion.div>
            ) : currentScene ? (
              <motion.div
                key={currentScene.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 0.8 }}
                className="w-full flex flex-col gap-3 pb-6"
              >
                <div className="ml-[28vw] w-[48vw]">
                  <DialogueBubble 
                    mode={currentScene.mode || 'dialogue'} 
                    speakerName={currentScene.speaker || 'The Oracle'}
                    text={currentScene.narrative} 
                    onComplete={() => setNarrativeComplete(true)}
                  />
                </div>

                {/* Choices strictly appear after narrative or if already complete */}
                {(narrativeComplete && currentScene.choices.length > 0) && (
                  <div className="ml-[28vw] w-[48vw]">
                    <ChoicePanel 
                      choices={currentScene.choices} 
                      onSelect={handleChoiceSelect} 
                      disabled={isTransitioning}
                    />
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
