import { AiStyle } from '@core/enums/ai-style.enum';
import { AiAssistMode } from './ai-assist';
import {
  AI_DESCRIBE,
  AI_FIRST_VERSION,
  AI_REVEAL_MAX_MS,
  AI_REWRITES,
  AI_WORD_DELAY_MAX_MS,
  aiOffer,
  aiShortcutLabel,
  aiWords,
  aiYours,
  isAiShortcut,
} from './ai-choices';

describe('AI help choices (0029)', () => {
  it.each([
    [AiAssistMode.Text, false, 'Write', AI_FIRST_VERSION],
    [AiAssistMode.Text, true, 'Improve', AI_REWRITES],
    [AiAssistMode.Picture, false, 'Describe', AI_DESCRIBE],
  ])('should offer the right choices for a %s field, filled: %s', (mode, filled, word, choices) => {
    expect(aiOffer(mode, filled)).toMatchObject({ word, choices });
  });

  it('should offer the five rewrites in the menu’s order', () => {
    expect(AI_REWRITES.map((choice) => choice.key)).toEqual([
      AiStyle.Clearer,
      AiStyle.Shorter,
      AiStyle.Warmer,
      AiStyle.Formal,
      AiStyle.Spelling,
    ]);
  });

  it('should space a short answer’s words by the longest step, keeping their spaces', () => {
    const words = aiWords('Drum with us.');

    expect(words).toEqual([
      { text: 'Drum ', delayMs: 0 },
      { text: 'with ', delayMs: AI_WORD_DELAY_MAX_MS },
      { text: 'us.', delayMs: 2 * AI_WORD_DELAY_MAX_MS },
    ]);
  });

  it('should start a long answer’s last word within the reveal time', () => {
    const words = aiWords(Array.from({ length: 200 }, () => 'beat').join(' '));

    expect(words.at(-1)?.delayMs).toBeLessThanOrEqual(AI_REVEAL_MAX_MS);
  });

  it('should have no words for an empty answer', () => {
    expect(aiWords('')).toEqual([]);
  });

  it('should cut a long text of the owner’s, and keep a short one', () => {
    expect(aiYours(` ${'x'.repeat(100)} `)).toBe(`${'x'.repeat(90)}…`);
    expect(aiYours(' Mine ')).toBe('Mine');
  });

  it.each([
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)', '⌘ J'],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Ctrl J'],
  ])('should write the shortcut for %s', (agent, label) => {
    expect(aiShortcutLabel(agent)).toBe(label);
  });

  it.each([
    [{ key: 'j', ctrlKey: true }, true],
    [{ key: 'J', metaKey: true }, true],
    [{ key: 'j' }, false],
    [{ key: 'j', ctrlKey: true, altKey: true }, false],
    [{ key: 'k', ctrlKey: true }, false],
  ])('should know the shortcut from %o', (init, expected) => {
    expect(isAiShortcut(new KeyboardEvent('keydown', init))).toBe(expected);
  });
});
