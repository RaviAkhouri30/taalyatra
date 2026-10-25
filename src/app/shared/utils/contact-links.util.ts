import { type IPhoneNumber } from '@shared/interfaces/i-contact-details';

/** Base URL of WhatsApp's click-to-chat links. */
const WHATSAPP_BASE_URL = 'https://wa.me/';

/**
 * @param phone Phone number to dial.
 * @returns A `tel:` URI.
 */
export function toTelHref(phone: IPhoneNumber): string {
  return `tel:${phone.e164}`;
}

/**
 * @param email Address to write to.
 * @returns A `mailto:` URI.
 */
export function toMailtoHref(email: string): string {
  return `mailto:${email}`;
}

/**
 * WhatsApp expects the number without the leading "+".
 * @param phone Number registered with WhatsApp.
 * @returns A click-to-chat URL.
 */
export function toWhatsAppUrl(phone: IPhoneNumber): string {
  return `${WHATSAPP_BASE_URL}${phone.e164.replace(/^\+/, '')}`;
}
