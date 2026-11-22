import { AiStyle } from '@core/enums/ai-style.enum';
import { AiAssistMode } from './ai-assist';

/** A first version (or, for a photo, a description), rather than a rewrite. */
export const AI_WRITE = 'write';

/** One thing the AI help's menu offers (0029). */
export interface IAiChoice {
  /** `AI_WRITE`, or the rewrite's style. */
  readonly key: typeof AI_WRITE | AiStyle;
  readonly label: string;
  /** A small sign beside the label; decoration only. */
  readonly glyph: string;
}

/** What the menu offers for a field with text: the rewrites, in the order the menu lists them (0025 D6). */
export const AI_REWRITES: readonly IAiChoice[] = [
  { key: AiStyle.Clearer, label: 'Clearer', glyph: '◎' },
  { key: AiStyle.Shorter, label: 'Shorter', glyph: '↧' },
  { key: AiStyle.Warmer, label: 'Warmer', glyph: '♡' },
  { key: AiStyle.Formal, label: 'More formal', glyph: '▤' },
  { key: AiStyle.Spelling, label: 'Fix spelling and grammar', glyph: '✓' },
];

/** What the menu offers for an empty field. */
export const AI_FIRST_VERSION: readonly IAiChoice[] = [
  { key: AI_WRITE, label: 'Write a first version', glyph: '✎' },
];

/** What the menu offers for a photo's description. */
export const AI_DESCRIBE: readonly IAiChoice[] = [
  { key: AI_WRITE, label: 'Describe the photo', glyph: '◉' },
];

/** The menu's heading and choices, and the chip's word. */
export interface IAiOffer {
  readonly heading: string;
  readonly word: string;
  readonly choices: readonly IAiChoice[];
}

/**
 * @param mode A text field, or a photo's description.
 * @param filled Whether the field has text.
 * @returns What the chip says and the menu offers.
 */
export function aiOffer(mode: AiAssistMode, filled: boolean): IAiOffer {
  if (mode === AiAssistMode.Picture) {
    return { heading: 'Write with AI', word: 'Describe', choices: AI_DESCRIBE };
  }
  return filled
    ? { heading: 'Rewrite it', word: 'Improve', choices: AI_REWRITES }
    : { heading: 'Write with AI', word: 'Write', choices: AI_FIRST_VERSION };
}

/** The longest wait between two words as a suggestion arrives. */
export const AI_WORD_DELAY_MAX_MS = 45;
/** However long the suggestion, its last word starts arriving by then. */
export const AI_REVEAL_MAX_MS = 1500;
/** How long Undo stays after a suggestion is used. */
export const AI_UNDO_MS = 8000;
/** The owner's own text, shown struck through beside the suggestion, is cut after this. */
export const AI_YOURS_MAX = 90;

/** One word of a suggestion and when it starts to arrive. */
export interface IAiWord {
  readonly text: string;
  readonly delayMs: number;
}

/**
 * @param text The suggestion.
 * @returns Its words, each with its delay, so any suggestion arrives within `AI_REVEAL_MAX_MS`.
 */
export function aiWords(text: string): IAiWord[] {
  // Spaces and line breaks stay with the word before them, so the text keeps its shape.
  const words = text.match(/\S+\s*/g) ?? [];
  const step = Math.min(AI_WORD_DELAY_MAX_MS, AI_REVEAL_MAX_MS / Math.max(words.length, 1));
  return words.map((word, index) => ({ text: word, delayMs: Math.round(index * step) }));
}

/**
 * @param text The owner's own text.
 * @returns It, cut to `AI_YOURS_MAX` characters with an ellipsis.
 */
export function aiYours(text: string): string {
  const trimmed = text.trim();
  return trimmed.length > AI_YOURS_MAX ? `${trimmed.slice(0, AI_YOURS_MAX)}…` : trimmed;
}

/**
 * @param userAgent The browser's description of itself.
 * @returns The shortcut as the owner's keyboard writes it: ⌘ J on a Mac, Ctrl J elsewhere.
 */
export function aiShortcutLabel(userAgent: string): string {
  return /Mac|iPhone|iPad/u.test(userAgent) ? '⌘ J' : 'Ctrl J';
}

/**
 * @param event A key pressed in a field.
 * @returns Whether it's the shortcut that opens the AI help: Ctrl J, or ⌘ J.
 */
export function isAiShortcut(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'j';
}
