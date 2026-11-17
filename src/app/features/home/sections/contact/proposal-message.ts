import { type IEmailMessage } from '@core/interfaces/i-email-service';
import { type IProposalMessageCopyDto } from './i-contact';
import { type ProposalValue } from './proposal-form';

/**
 * Builds the proposal message shared by the email and WhatsApp channels (design wording):
 * a greeting, one "Label: value" line per filled-in field, then the free-text message.
 */
export class ProposalMessage {
  public constructor(private readonly copy: IProposalMessageCopyDto) {}

  /** @returns The message body. */
  public body(value: ProposalValue): string {
    const { labels } = this.copy;
    const pairs: readonly (readonly [string, string])[] = [
      [labels.need, value.need],
      [labels.eventType, value.eventType],
      [labels.groupSize, value.groupSize],
      [labels.experience, value.experience],
      [labels.date, value.date],
      [labels.name, value.name],
      [labels.phone, value.phone],
      [labels.email, value.email],
    ];
    const lines = pairs
      .filter(([, text]) => text.trim())
      .map(([label, text]) => `${label}: ${text.trim()}\n`)
      .join('');
    const note = value.message.trim() ? `\n${value.message.trim()}` : '';
    return `${this.copy.greeting}\n\n${lines}${note}`;
  }

  /** @returns The subject, naming the experience when one is chosen. */
  public subject(value: ProposalValue): string {
    return value.experience ? `${this.copy.subject}: ${value.experience}` : this.copy.subject;
  }

  /** @returns The email to send for `value`: every form field, trimmed, under its own name. */
  public email(value: ProposalValue): IEmailMessage {
    const fields = Object.fromEntries(
      Object.entries(value).map(([field, text]) => [field, text.trim()]),
    );
    return { subject: this.subject(value), fields };
  }
}
