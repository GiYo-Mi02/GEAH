'use client';

import { generateScene } from './claude';
import type { Scene, PlayerState, ClaudeOutput } from './types';

// ─── In-Memory Scene Cache ─────────────────────────────────────────
// Survives within a single page session. Persistent state is in puter.kv.
let cachedScene: Scene | null = null;
let cachedPlayerName: string = 'Wanderer';

// ─── Helper: Store player name ─────────────────────────────────────

export function setPlayerName(name: string): void {
  cachedPlayerName = name;
}

function getPlayerName(): string {
  return cachedPlayerName;
}

// ─── Helper: Clamp stats to 0-100 ─────────────────────────────────

function clamp(val: number): number {
  return Math.max(0, Math.min(100, val));
}

// ─── Helper: Build Scene from Claude output ────────────────────────

function buildScene(output: ClaudeOutput, act: number, scene: number): Scene {
  return {
    id: output.scene_meta.title.toLowerCase().replace(/\s+/g, '_'),
    act,
    scene,
    title: output.scene_meta.title,
    narrative: output.narrative,
    choices: output.choices,
    background: output.scene_meta.background,
    speaker: output.scene_meta.speaker,
    emotion: output.scene_meta.emotion,
    mode: output.scene_meta.mode,
  };
}

// ─── Session type for puter.kv ─────────────────────────────────────

type GameSession = {
  currentScene: Scene;
  playerState: PlayerState;
  act: number;
  scene: number;
  history: Array<{
    choice_label: string;
    narrative_shown: string;
    timestamp: string;
  }>;
};

// ─── Check for saved session ───────────────────────────────────────

export async function hasSavedSession(): Promise<boolean> {
  try {
    const saved = await window.puter.kv.get('rpg_session');
    return saved !== null && saved !== undefined;
  } catch {
    return false;
  }
}

// ─── Clear saved session ───────────────────────────────────────────

export async function clearSession(): Promise<void> {
  try {
    await window.puter.kv.del('rpg_session');
  } catch {
    // Silently fail — session may not exist
  }
}

// ─── Get saved session data ────────────────────────────────────────

export async function getSavedSession(): Promise<GameSession | null> {
  try {
    const saved = await window.puter.kv.get('rpg_session');
    if (saved) {
      return JSON.parse(saved) as GameSession;
    }
  } catch {
    // Corrupted data — treat as no session
  }
  return null;
}

// ─── startGame ─────────────────────────────────────────────────────

export const startGame = async (
  playerName: string
): Promise<{ scene: Scene; player_state: PlayerState; session_id: string }> => {
  setPlayerName(playerName);

  const defaultPlayer: PlayerState = {
    name: playerName,
    health: 100,
    morality: 50,
    reputation: 50,
    inventory: [],
    key_events: [],
  };

  const output = await generateScene(
    defaultPlayer,
    'begin the journey',
    [],
    1,
    1
  );

  const scene = buildScene(output, 1, 1);
  cachedScene = scene;

  // Apply initial state_delta (if any)
  const playerState: PlayerState = {
    ...defaultPlayer,
    morality: clamp(defaultPlayer.morality + output.state_delta.morality),
    health: clamp(defaultPlayer.health + output.state_delta.health),
    reputation: clamp(defaultPlayer.reputation + output.state_delta.reputation),
    key_events: [...defaultPlayer.key_events, ...output.state_delta.new_events],
    inventory: [...defaultPlayer.inventory, ...output.state_delta.inventory_add],
  };

  // Persist to puter.kv
  await window.puter.kv.set(
    'rpg_session',
    JSON.stringify({
      currentScene: scene,
      playerState,
      act: 1,
      scene: 1,
      history: [],
    } satisfies GameSession)
  );

  return { scene, player_state: playerState, session_id: 'puter_local' };
};

// ─── fetchScene ────────────────────────────────────────────────────

export const fetchScene = async (sceneId: string): Promise<Scene> => {
  // Starting a new game
  if (sceneId === 'start') {
    // Check for saved session to resume
    const session = await getSavedSession();
    if (session) {
      cachedScene = session.currentScene;
      return session.currentScene;
    }

    // Generate fresh opening scene
    const playerName = getPlayerName();
    const result = await startGame(playerName);
    return result.scene;
  }

  // Return cached scene from a previous makeChoice call
  if (cachedScene) {
    return cachedScene;
  }

  // Fallback: try loading from puter.kv
  const session = await getSavedSession();
  if (session?.currentScene) {
    cachedScene = session.currentScene;
    return session.currentScene;
  }

  // Last resort: return a minimal error scene
  return {
    id: 'error',
    act: 0,
    scene: 0,
    title: 'Lost in the Void',
    narrative:
      'The threads of fate have become tangled. The world shimmers and reforms around you, pulling you back to familiar ground.',
    choices: [],
  };
};

// ─── makeChoice ────────────────────────────────────────────────────

export const makeChoice = async (
  currentSceneId: string,
  choiceId: string,
  playerState: PlayerState
): Promise<{ nextSceneId: string; updatedState: PlayerState }> => {
  // Get history and act/scene from puter.kv
  const session = await getSavedSession();
  const sessionData = session || { history: [], act: 1, scene: 1 };

  const currentScene = cachedScene!;
  const choiceLabel =
    currentScene.choices.find((c) => c.id === choiceId)?.label ?? choiceId;

  const output = await generateScene(
    playerState,
    choiceLabel,
    sessionData.history,
    sessionData.act,
    sessionData.scene + 1
  );

  // Apply state_delta
  const updatedState: PlayerState = {
    ...playerState,
    morality: clamp(playerState.morality + output.state_delta.morality),
    health: clamp(playerState.health + output.state_delta.health),
    reputation: clamp(playerState.reputation + output.state_delta.reputation),
    key_events: [...playerState.key_events, ...output.state_delta.new_events],
    inventory: [
      ...playerState.inventory.filter(
        (i) => !output.state_delta.inventory_remove.includes(i)
      ),
      ...output.state_delta.inventory_add,
    ],
  };

  // Check for act advancement (every 4 scenes = new act)
  const newSceneNum = sessionData.scene + 1;
  const newAct =
    newSceneNum > 4 && newSceneNum % 4 === 1
      ? sessionData.act + 1
      : sessionData.act;

  const nextScene = buildScene(output, newAct, newSceneNum);
  cachedScene = nextScene;

  // Persist to puter.kv (cap history at 20 entries to stay under 50KB)
  const updatedHistory = [
    ...sessionData.history,
    {
      choice_label: choiceLabel,
      narrative_shown: currentScene.narrative,
      timestamp: new Date().toISOString(),
    },
  ].slice(-20);

  await window.puter.kv.set(
    'rpg_session',
    JSON.stringify({
      currentScene: nextScene,
      playerState: updatedState,
      act: newAct,
      scene: newSceneNum,
      history: updatedHistory,
    } satisfies GameSession)
  );

  return {
    nextSceneId: output.is_game_over ? 'game_over' : nextScene.id,
    updatedState,
  };
};
