// ─── Core Game Types ───────────────────────────────────────────────

export type Choice = {
  id: string;
  label: string;
  consequence_hint?: string;
  icon_hint?: 'sword' | 'shield' | 'eye' | 'talk' | 'run';
  difficulty?: 'safe' | 'risky' | 'deadly';
};

export type Scene = {
  id: string;
  act: number;
  scene: number;
  title: string;
  narrative: string;
  choices: Choice[];
  background?: 'forest' | 'castle' | 'abyss' | 'village' | 'cave' | 'throne';
  speaker?: string | null;
  emotion?: 'calm' | 'tense' | 'danger' | 'neutral';
  mode?: 'narration' | 'dialogue';
};

export type PlayerState = {
  name: string;
  morality: number; // 0-100
  reputation: number; // 0-100
  health: number; // 0-100
  inventory: string[];
  key_events: string[];
};

// ─── History & Session Types ───────────────────────────────────────

export type HistoryEntry = {
  scene_id: string;
  choice_id: string;
  choice_label: string;
  narrative_shown: string;
  timestamp: string;
};

// ─── Claude AI Types ───────────────────────────────────────────────

export type ClaudeInput = {
  playerState: PlayerState;
  history: HistoryEntry[];
  choiceLabel: string;
  act: number;
  scene: number;
};

export type ClaudeOutput = {
  narrative: string;
  choices: Choice[];
  state_delta: {
    morality: number;
    health: number;
    reputation: number;
    new_events: string[];
    inventory_add: string[];
    inventory_remove: string[];
  };
  scene_meta: {
    title: string;
    background: Scene['background'];
    speaker: string | null;
    emotion: Scene['emotion'];
    mode: Scene['mode'];
  };
  is_game_over: boolean;
  ending_type: string | null;
};
