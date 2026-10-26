import { IconName } from '@shared/enums/icon-name.enum';
import { type IContactDetails } from '@shared/interfaces/i-contact-details';
import { toMailtoHref, toTelHref, toWhatsAppUrl } from '@shared/utils/contact-links.util';
import { formatTemplate } from '@shared/utils/format-template.util';
import { type IContactDto, type IContactOptionDto, type IProposalFormCopyDto } from './i-contact';
import { type ProposalValue } from './proposal-form';
import { ProposalMessage } from './proposal-message';

/** A "Prefer to talk?" row: icon, title, detail line and destination. */
export interface IContactRow {
  readonly icon: IconName;
  readonly title: string;
  readonly detail: string;
  readonly href: string;
}

/** The aside next to the form. */
export interface IContactAside {
  readonly title: string;
  readonly rows: readonly IContactRow[];
  readonly noteTitle: string;
  readonly noteText: string;
}

/** Contact section: header copy, form copy, the message builder and the direct-contact aside. */
export class ContactModel {
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly lead: string;
  public readonly assurances: readonly string[];
  public readonly form: IProposalFormCopyDto;
  public readonly message: ProposalMessage;
  public readonly aside: IContactAside;
  private readonly whatsAppUrl: string;

  public constructor(dto: IContactDto, contact: IContactDetails) {
    this.eyebrow = dto.eyebrow;
    this.title = dto.title;
    this.lead = dto.lead;
    this.assurances = dto.assurances;
    this.form = dto.form;
    this.message = new ProposalMessage(dto.message);
    this.whatsAppUrl = toWhatsAppUrl(contact.phone);

    const params = { phone: contact.phone.display, hours: contact.hours, email: contact.email };
    const row = (icon: IconName, option: IContactOptionDto, href: string): IContactRow => ({
      icon,
      title: option.title,
      detail: formatTemplate(option.detail, params),
      href,
    });
    this.aside = {
      title: dto.aside.title,
      rows: [
        row(IconName.WhatsApp, dto.aside.whatsApp, this.whatsAppUrl),
        row(IconName.Phone, dto.aside.call, toTelHref(contact.phone)),
        row(IconName.Mail, dto.aside.email, toMailtoHref(contact.email)),
      ],
      noteTitle: dto.aside.noteTitle,
      noteText: dto.aside.noteText,
    };
  }

  /** @returns A WhatsApp click-to-chat link with the proposal already written. */
  public whatsAppHref(value: ProposalValue): string {
    return `${this.whatsAppUrl}?text=${encodeURIComponent(this.message.body(value))}`;
  }
}
