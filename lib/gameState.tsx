"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { PlayerState, Scene } from './types';

type GameState = {
  player: PlayerState | null;
  currentScene: Scene | null;
  isLoading: boolean;
  history: string[]; // Keep track of past scenes maybe
};

type Action =
  | { type: 'SET_PLAYER'; payload: PlayerState }
  | { type: 'SET_SCENE'; payload: Scene }
  | { type: 'UPDATE_PLAYER'; payload: PlayerState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_GAME' };

const initialPlayerState: PlayerState = {
  name: 'Wanderer',
  health: 100,
  morality: 50,
  reputation: 50,
  inventory: [],
  key_events: [],
};

const initialState: GameState = {
  player: null,
  currentScene: null,
  isLoading: false,
  history: [],
};

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, player: action.payload };
    case 'SET_SCENE':
      return { ...state, currentScene: action.payload, history: [...state.history, action.payload.id] };
    case 'UPDATE_PLAYER':
      return { ...state, player: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const defaultPlayerState = initialPlayerState;
