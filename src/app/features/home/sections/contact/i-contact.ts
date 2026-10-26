/** Proposal form fields, in display order. */
export type ProposalField =
  | 'need'
  | 'eventType'
  | 'experience'
  | 'groupSize'
  | 'date'
  | 'name'
  | 'phone'
  | 'email'
  | 'message';

/** A labelled group of options (`<optgroup>`). */
export interface IOptionGroupDto {
  readonly label: string;
  readonly options: readonly string[];
}

/** Proposal form copy and options. */
export interface IProposalFormCopyDto {
  readonly fields: Readonly<Record<ProposalField | 'optional', string>>;
  readonly placeholders: Readonly<Record<'name' | 'phone' | 'email' | 'message', string>>;
  readonly needs: readonly string[];
  readonly eventTypes: readonly string[];
  readonly experienceGroups: readonly IOptionGroupDto[];
  readonly experienceFallback: string;
  readonly groupSizes: readonly string[];
  readonly defaults: Readonly<Record<'need' | 'eventType' | 'experience' | 'groupSize', string>>;
  readonly submit: string;
  readonly sending: string;
  readonly whatsApp: string;
  readonly finePrint: string;
  readonly sent: string;
  readonly failed: string;
  readonly errors: Readonly<Record<'name' | 'phone' | 'email', string>>;
}

/** Wording of the proposal message sent by email or WhatsApp. */
export interface IProposalMessageCopyDto {
  readonly greeting: string;
  readonly subject: string;
  readonly labels: Readonly<Record<Exclude<ProposalField, 'message'>, string>>;
}

/** A contact option in the aside; `detail` may contain `{phone}`, `{hours}` or `{email}`. */
export interface IContactOptionDto {
  readonly title: string;
  readonly detail: string;
}

/** Contact section as stored in the backend (`home/contact`). */
export interface IContactDto {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly assurances: readonly string[];
  readonly form: IProposalFormCopyDto;
  readonly message: IProposalMessageCopyDto;
  readonly aside: {
    readonly title: string;
    readonly whatsApp: IContactOptionDto;
    readonly call: IContactOptionDto;
    readonly email: IContactOptionDto;
    readonly noteTitle: string;
    readonly noteText: string;
  };
}
