import { type DocumentFields } from '@core/interfaces/i-document-store';
import { fieldOf } from '../forms/json-node';
import { formatMoment } from './editor-dates';
import { monthOf, siteDay } from './site-days';
import { reportTime } from './speed-report.model';

/** Where proposals are stored (`firestore.rules`: visitors create; the admin reads, deletes). */
export const LEADS_COLLECTION = 'proposals';

/** Where a lead stands (0018 decision 6). Stored in English, as `firestore.rules` lists them. */
export enum LeadStatus {
  New = 'new',
  Contacted = 'contacted',
  Won = 'won',
  Lost = 'lost',
}

/** Each status in the owner's words, in the order a lead moves through them. */
export const LEAD_STATUSES: readonly { readonly status: LeadStatus; readonly label: string }[] = [
  { status: LeadStatus.New, label: 'New' },
  { status: LeadStatus.Contacted, label: 'Contacted' },
  { status: LeadStatus.Won, label: 'Won' },
  { status: LeadStatus.Lost, label: 'Lost' },
];

const STATUS_BY_VALUE = new Map<string, LeadStatus>(
  LEAD_STATUSES.map(({ status }) => [status, status]),
);

/**
 * @param value A stored or chosen value.
 * @returns The status it names, or `undefined` when it names none.
 */
export function toLeadStatus(value: string): LeadStatus | undefined {
  return STATUS_BY_VALUE.get(value);
}

/** @returns The status in the owner's words. */
export function leadStatusLabel(status: LeadStatus): string {
  return LEAD_STATUSES.find((entry) => entry.status === status)?.label ?? status;
}
/** India's country code, for numbers written without one. */
const INDIA = '91';
/** A number written without a country code: ten digits, as Indian mobiles are. */
const NATIONAL_DIGITS = 10;
const WHATSAPP_BASE_URL = 'https://wa.me/';

function text(fields: DocumentFields, key: string): string {
  const value = fieldOf(fields, key);
  return typeof value === 'string' ? value.trim() : '';
}

/** One proposal from the site's form, as the Leads page shows it (0018 V12). */
export class Lead {
  public readonly name: string;
  public readonly phone: string;
  public readonly email: string;
  public readonly need: string;
  public readonly eventType: string;
  public readonly experience: string;
  public readonly groupSize: string;
  /** The date the visitor asked for, as they wrote it. */
  public readonly date: string;
  public readonly message: string;
  /** Proposals from before 1.13.0 have no status: they're new. */
  public readonly status: LeadStatus;
  /** When it arrived, in milliseconds, or `null` when it can't be told. */
  public readonly receivedAt: number | null;
  /** When it arrived, in words. */
  public readonly received: string;
  /** The day it arrived, in India (`YYYY-MM-DD`), or empty when unknown. */
  public readonly day: string;
  /** The month it arrived (`YYYY-MM`), or empty when unknown. */
  public readonly month: string;

  /**
   * @param id The stored document's id.
   * @param fields The stored proposal, kept whole so a status change writes back exactly what
   *   was read (the rules refuse any other change).
   */
  public constructor(
    public readonly id: string,
    public readonly fields: DocumentFields,
  ) {
    this.name = text(fields, 'name');
    this.phone = text(fields, 'phone');
    this.email = text(fields, 'email');
    this.need = text(fields, 'need');
    this.eventType = text(fields, 'eventType');
    this.experience = text(fields, 'experience');
    this.groupSize = text(fields, 'groupSize');
    this.date = text(fields, 'date');
    this.message = text(fields, 'message');
    this.status = toLeadStatus(text(fields, 'status')) ?? LeadStatus.New;
    this.receivedAt = reportTime(fields);
    this.received =
      this.receivedAt === null
        ? 'Date not known'
        : formatMoment(new Date(this.receivedAt).toISOString());
    this.day = this.receivedAt === null ? '' : siteDay(this.receivedAt);
    this.month = this.day && monthOf(this.day);
  }

  /** The phone's digits with a country code; Indian numbers are often written without one. */
  public get phoneDigits(): string {
    const digits = this.phone.replace(/\D/g, '');
    return digits.length === NATIONAL_DIGITS ? `${INDIA}${digits}` : digits;
  }

  /** @returns A `tel:` link, or empty when there's no number. */
  public get callLink(): string {
    return this.phoneDigits ? `tel:+${this.phoneDigits}` : '';
  }

  /** @returns A WhatsApp chat link, or empty when there's no number. */
  public get whatsAppLink(): string {
    return this.phoneDigits ? `${WHATSAPP_BASE_URL}${this.phoneDigits}` : '';
  }

  /** @returns A `mailto:` link, or empty when there's no address. */
  public get mailLink(): string {
    return this.email ? `mailto:${this.email}` : '';
  }
}

/** @returns Leads newest first; those with no date last. */
export function newestFirst(leads: readonly Lead[]): Lead[] {
  return [...leads].sort((left, right) => (right.receivedAt ?? 0) - (left.receivedAt ?? 0));
}
