import { type IReplyRuleDto } from './i-assistant';

/**
 * Answers questions from canned replies (design behaviour): the first rule with a keyword
 * found anywhere in the question wins, otherwise the fallback suggests WhatsApp.
 */
export class AssistantReplies {
  public constructor(
    private readonly rules: readonly IReplyRuleDto[],
    private readonly fallback: string,
  ) {}

  /** @returns The reply to `question`. */
  public reply(question: string): string {
    const text = question.toLowerCase();
    const rule = this.rules.find(({ keywords }) => keywords.some((word) => text.includes(word)));
    return rule?.text ?? this.fallback;
  }
}
