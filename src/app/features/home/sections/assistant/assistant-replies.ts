import { type IReplyRuleDto } from './i-assistant';

/**
 * Answers questions from canned replies (design behaviour): the first rule with a keyword
 * found anywhere in the question, whatever its case, wins, otherwise the fallback suggests WhatsApp.
 */
export class AssistantReplies {
  public constructor(
    private readonly rules: readonly IReplyRuleDto[],
    private readonly fallback: string,
  ) {}

  /** @returns The reply to `question`. */
  public reply(question: string): string {
    const text = question.toLowerCase();
    // Both sides lower-cased: the owner may write a word as "WhatsApp" in the admin (0028).
    const rule = this.rules.find(({ keywords }) =>
      keywords.some((word) => text.includes(word.toLowerCase())),
    );
    return rule?.text ?? this.fallback;
  }
}
