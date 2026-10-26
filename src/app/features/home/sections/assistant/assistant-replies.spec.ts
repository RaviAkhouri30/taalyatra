import { HOME } from '../../testing/home-fixtures';
import { AssistantReplies } from './assistant-replies';

describe('AssistantReplies', () => {
  const replies = new AssistantReplies(HOME.assistant.replies, HOME.assistant.fallback);

  it('should answer from the first rule whose keyword appears in the question', () => {
    expect(replies.reply('What does it COST for a family party?')).toMatch(/^Pricing depends/);
  });

  it('should match keywords anywhere in the question', () => {
    expect(replies.reply('How many people can join?')).toMatch(/^Drum Circle runs from 10/);
  });

  it('should fall back to suggesting WhatsApp when nothing matches', () => {
    expect(replies.reply('Xyz?')).toBe(HOME.assistant.fallback);
  });
});
