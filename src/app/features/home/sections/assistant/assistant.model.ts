import { type IBrand } from '@shared/interfaces/i-brand';
import { type IContactDetails } from '@shared/interfaces/i-contact-details';
import { toTelHref, toWhatsAppUrl } from '@shared/utils/contact-links.util';
import { formatTemplate } from '@shared/utils/format-template.util';
import { AssistantReplies } from './assistant-replies';
import { type ChatRole } from './chat-role.enum';
import { type IAssistantDto, type IAssistantLabelsDto } from './i-assistant';

/** One chat bubble. */
export interface IChatMessage {
  readonly id: number;
  readonly role: ChatRole;
  readonly text: string;
}

/** Chat assistant: copy, contact links and the reply logic. */
export class AssistantModel {
  public readonly title: string;
  public readonly status: string;
  public readonly greeting: string;
  public readonly tease: string;
  public readonly labels: IAssistantLabelsDto;
  public readonly whatsAppLink: string;
  public readonly quickReplies: readonly string[];
  public readonly avatarUrl: string;
  public readonly callHref: string;
  public readonly whatsAppHref: string;
  private readonly replies: AssistantReplies;

  public constructor(dto: IAssistantDto, contact: IContactDetails, brand: IBrand) {
    this.title = dto.title;
    this.status = dto.status;
    this.greeting = dto.greeting;
    this.tease = dto.tease;
    this.labels = dto.labels;
    this.whatsAppLink = dto.whatsAppLink;
    this.quickReplies = dto.quickReplies;
    this.avatarUrl = brand.logoUrl;
    this.callHref = toTelHref(contact.phone);
    this.whatsAppHref = toWhatsAppUrl(contact.phone);
    const rules = dto.replies.map((rule) => ({
      ...rule,
      text: formatTemplate(rule.text, { email: contact.email }),
    }));
    this.replies = new AssistantReplies(rules, dto.fallback);
  }

  /** @returns The assistant's reply to `question`. */
  public reply(question: string): string {
    return this.replies.reply(question);
  }
}
