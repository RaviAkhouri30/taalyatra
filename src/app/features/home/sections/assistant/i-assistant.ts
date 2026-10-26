/** A canned reply, chosen when the question contains any of its keywords. */
export interface IReplyRuleDto {
  readonly keywords: readonly string[];
  /** Reply text; may contain `{email}`. */
  readonly text: string;
}

/** Accessible names and small copy used by the assistant's controls. */
export interface IAssistantLabelsDto {
  readonly toggle: string;
  readonly close: string;
  readonly call: string;
  readonly whatsApp: string;
  readonly typing: string;
  readonly input: string;
  readonly placeholder: string;
  readonly send: string;
  readonly messages: string;
}

/** Chat assistant as stored in the backend (`home/assistant`). */
export interface IAssistantDto {
  readonly title: string;
  readonly status: string;
  readonly greeting: string;
  readonly tease: string;
  readonly labels: IAssistantLabelsDto;
  readonly whatsAppLink: string;
  readonly quickReplies: readonly string[];
  /** Checked in order; the first rule with a matching keyword wins. */
  readonly replies: readonly IReplyRuleDto[];
  readonly fallback: string;
}
