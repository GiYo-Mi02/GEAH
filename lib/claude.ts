'use client';

import type { ClaudeOutput, PlayerState, HistoryEntry } from './types';

// ─── Model Selection Strategy ──────────────────────────────────────

const MODEL_MAP = {
  standard: 'claude-sonnet-4-6',   // most scenes
  climax:   'claude-opus-4-7',     // act endings, boss moments
  fast:     'claude-haiku-3-5',    // loading fallback or low-stakes
} as const;

function selectModel(act: number, isGameOver: boolean): string {
  if (isGameOver) return MODEL_MAP.climax;
  if (act >= 3 && act % 3 === 0) return MODEL_MAP.climax;
  return MODEL_MAP.standard;
}

// ─── Game Master System Prompt ─────────────────────────────────────

const GAME_MASTER_PROMPT = `You are the Game Master of a dark fantasy interactive story called "Shadows of the Abyss". Narrate consequences of player choices and generate the next scene.

RULES:
- Maintain strict narrative consistency with the player's key_events
- Morality: 0=pure evil, 100=pure good. Move it meaningfully per choice.
- Health: 0=dead, 100=full. Combat and recklessness reduce it.
- Reputation: 0=notorious, 100=legendary.
- After 8-12 scenes converge toward an ending matching the player's choices.
- Morality below 20 trends toward dark ending.
- Health reaching 0 forces is_game_over: true, ending_type: 'death'.
- Make choices feel genuinely different in consequence.
- Keep narrative concise: 1-3 sentences total.

RESPOND ONLY with a single valid JSON object. No markdown. No preamble.
No text outside the JSON. Match this exact schema:

{
  "narrative": "1-3 sentences, past tense, second person",
  "choices": [
    {
      "id": "snake_case_id",
      "label": "action phrase max 8 words",
      "consequence_hint": "vague hint max 6 words",
      "icon_hint": "sword|shield|eye|talk|run",
      "difficulty": "safe|risky|deadly"
    }
  ],
  "state_delta": {
    "morality": 0,
    "health": 0,
    "reputation": 0,
    "new_events": [],
    "inventory_add": [],
    "inventory_remove": []
  },
  "scene_meta": {
    "title": "3-5 word evocative title",
    "background": "forest|castle|abyss|village|cave|throne",
    "speaker": null,
    "emotion": "calm|tense|danger|neutral",
    "mode": "narration|dialogue"
  },
  "is_game_over": false,
  "ending_type": null
}`;

// ─── JSON Parsing Helpers ──────────────────────────────────────────

function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\n?```\s*$/i, '');
  return cleaned.trim();
}

function parseClaudeResponse(text: string): ClaudeOutput {
  const cleaned = stripMarkdownFences(text);
  try {
    return JSON.parse(cleaned) as ClaudeOutput;
  } catch {
    throw { code: 'CLAUDE_PARSE_ERROR', raw: cleaned };
  }
}

// ─── Scene Generation (Client-Side via Puter.js) ───────────────────

/**
 * Extract text content from a Puter.js AI response.
 * Handles both string and Anthropic-style array formats.
 */
function extractContent(response: unknown): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resp = response as any;

  // Format: response.message.content (string)
  if (typeof resp?.message?.content === 'string') {
    return resp.message.content;
  }
  // Format: response.message.content[0].text (Anthropic array)
  if (Array.isArray(resp?.message?.content) && resp.message.content[0]?.text) {
    return resp.message.content[0].text;
  }
  // Format: plain string response
  if (typeof resp === 'string') {
    return resp;
  }

  throw { code: 'CLAUDE_PARSE_ERROR', raw: JSON.stringify(response) };
}

/**
 * Generate the next scene using Puter.js AI chat.
 * This replaces all server-side Anthropic API calls.
 * Must be called from a client component or event handler.
 *
 * Uses messages array format (not systemPrompt option) to ensure
 * the system instruction is properly enforced.
 */
export async function generateScene(
  playerState: PlayerState,
  choiceLabel: string,
  history: Array<{ choice_label: string; narrative_shown: string }>,
  act: number,
  scene: number
): Promise<ClaudeOutput> {
  const model = selectModel(act, false);

  const historyContext = history
    .slice(-5)
    .map(
      (h) =>
        `Player chose: "${h.choice_label}"\nResult: ${h.narrative_shown.slice(0, 200)}...`
    )
    .join('\n\n');

  // Build messages array — system instruction as first message
  const messages = [
    {
      role: 'system',
      content: GAME_MASTER_PROMPT,
    },
    {
      role: 'user',
      content: `CURRENT PLAYER STATE:
${JSON.stringify(playerState, null, 2)}

RECENT HISTORY (last 5 turns):
${historyContext || 'This is the very beginning of the story.'}

PLAYER JUST CHOSE: "${choiceLabel}"

ACT: ${act}, SCENE: ${scene}

IMPORTANT: You MUST respond with ONLY a single valid JSON object. No markdown headings, no "---" separators, no prose outside JSON. Start your response with "{" and end with "}". Follow the exact JSON schema from your instructions.`,
    },
  ];

  const puter = window.puter;

  console.log('[GEAH] Using model:', model);

  // Retry once on parse failure
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await puter.ai.chat(messages, { model });

      const raw = extractContent(response);
      console.log('[GEAH] Raw AI response (first 300 chars):', raw.slice(0, 300));

      return parseClaudeResponse(raw);
    } catch (err: unknown) {
      const errMsg = err instanceof Error
        ? err.message
        : JSON.stringify(err, Object.getOwnPropertyNames(err as object));
      console.error(`[GEAH] generateScene attempt ${attempt} failed:`, errMsg);

      const error = err as { code?: string };
      if (error?.code === 'CLAUDE_PARSE_ERROR' && attempt === 0) {
        continue; // Retry once
      }
      if (attempt === 1) throw new Error(`CLAUDE_PARSE_ERROR: ${errMsg}`);
    }
  }

  throw new Error('CLAUDE_UNREACHABLE');
}

// ─── Epilogue Generation ───────────────────────────────────────────

/**
 * Generate a short epilogue summary for a completed game.
 * Lightweight call — no choices needed, just a narrative wrap-up.
 */
export async function generateEpilogue(
  playerState: PlayerState,
  history: HistoryEntry[]
): Promise<string> {
  const recentHistory = history.slice(-5);

  const prompt = `The player "${playerState.name}" has completed their journey in "Shadows of the Abyss".

Final stats:
- Morality: ${playerState.morality}/100
- Health: ${playerState.health}/100
- Reputation: ${playerState.reputation}/100
- Key events: ${playerState.key_events.join(', ') || 'none'}
- Inventory: ${playerState.inventory.join(', ') || 'empty'}

Recent history:
${recentHistory.map((h) => `- Chose: "${h.choice_label}"`).join('\n')}

Write a 2-3 sentence epilogue summarizing their journey and its conclusion. Use second person, past tense. Be evocative and final. Return ONLY the epilogue text, no JSON, no formatting.`;

  try {
    const response = await window.puter.ai.chat(prompt, {
      model: MODEL_MAP.standard,
    });

    const text = extractContent(response);
    return text.trim();
  } catch {
    // Fallback epilogue if Puter.js call fails
    return `The tale of ${playerState.name} fades into the shadows, leaving only echoes of choices made in darkness.`;
  }
}
