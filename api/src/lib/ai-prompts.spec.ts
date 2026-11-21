import { describe, expect, it } from 'vitest';
import {
  AiStyle,
  AiTask,
  type IAiWriteInput,
  fitAnswer,
  leadsMessages,
  writeMessages,
} from './ai-prompts.js';

const INPUT: IAiWriteInput = {
  task: AiTask.Rewrite,
  style: AiStyle.Shorter,
  text: 'Drum with us.',
  label: 'Headline',
  hint: 'The big line',
  page: 'Hero',
  context: 'Come and play.',
  maxLength: 60,
  imageUrl: null,
};

describe('AI prompts', () => {
  it('should give the business and the rules first, then the style and the field as data', () => {
    const [system, user] = writeMessages(INPUT);

    expect(system?.content).toContain('Taal Yatra');
    expect(system?.content).toContain('Answer with the text only');
    expect(user?.content).toContain('Rewrite it shorter');
    expect(user?.content).toContain('At most 60 characters.');
    expect(user?.content).toContain('"""\nDrum with us.\n"""');
  });

  it.each([
    [AiStyle.Clearer, 'clearer'],
    [AiStyle.Warmer, 'warmer'],
    [AiStyle.Formal, 'more formal'],
    [AiStyle.Spelling, 'Fix spelling'],
  ])('should ask for the %s style', (style, words) => {
    expect(writeMessages({ ...INPUT, style })[1]?.content).toContain(words);
  });

  it('should ask for a first version of an empty field, without a limit when there is none', () => {
    const content = writeMessages({
      ...INPUT,
      task: AiTask.Suggest,
      style: null,
      text: '',
      maxLength: null,
    })[1]?.content;

    expect(content).toContain('first version');
    expect(content).not.toContain('At most');
  });

  it('should send the picture with a description request', () => {
    const content = writeMessages({
      ...INPUT,
      task: AiTask.Describe,
      style: null,
      imageUrl: 'https://x/y.jpg',
    })[1]?.content;

    expect(content).toEqual([
      { type: 'text', text: expect.stringContaining('Describe this photo') as unknown },
      { type: 'image_url', image_url: { url: 'https://x/y.jpg' } },
    ]);
  });

  it('should send the leads as counts, asking for short points', () => {
    const [system, user] = leadsMessages({ total: 3 });

    expect(system?.content).toContain('never who sent them');
    expect(user?.content).toBe('{"total":3}');
  });

  it.each([
    ['"Quoted."', null, 'Quoted.'],
    ['Short', 10, 'Short'],
    ['Drum with us today', 12, 'Drum with'],
    ['Unbroken', 4, 'Unbr'],
  ])('should fit %s into %s characters', (text, max, fitted) => {
    expect(fitAnswer(text, max)).toBe(fitted);
  });
});
