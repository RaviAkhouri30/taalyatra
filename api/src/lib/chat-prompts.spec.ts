import { describe, expect, it } from 'vitest';
import { ChatRole, chatMessages } from './chat-prompts.js';

describe('chat prompts', () => {
  it('should give the rules and the site first, then the conversation and the question as data', () => {
    const [system, user] = chatMessages('## faq\nTwo hours.', {
      question: 'How long is it?',
      history: [
        { role: ChatRole.Visitor, text: 'Hi' },
        { role: ChatRole.Bot, text: 'Hello!' },
      ],
    });

    expect(system?.content).toContain('Never invent prices');
    expect(system?.content).toContain('"""\n## faq\nTwo hours.\n"""');
    expect(user?.content).toContain('Visitor: Hi\nYou: Hello!');
    expect(user?.content).toContain('The visitor asks:\n"""\nHow long is it?\n"""');
  });

  it('should leave out an empty conversation', () => {
    expect(chatMessages('x', { question: 'Q', history: [] })[1]?.content).not.toContain(
      'conversation',
    );
  });
});
