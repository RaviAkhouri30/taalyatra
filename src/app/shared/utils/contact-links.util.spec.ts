import { toMailtoHref, toTelHref, toWhatsAppUrl } from './contact-links.util';

describe('contact link utils', () => {
  const phone = { display: '+91 92842 76168', e164: '+919284276168' };

  it('should build a tel: URI from the E.164 number', () => {
    expect(toTelHref(phone)).toBe('tel:+919284276168');
  });

  it('should build a mailto: URI', () => {
    expect(toMailtoHref('contact@taalyatra.in')).toBe('mailto:contact@taalyatra.in');
  });

  it('should strip the leading plus for WhatsApp', () => {
    expect(toWhatsAppUrl(phone)).toBe('https://wa.me/919284276168');
  });

  it('should keep numbers that have no leading plus', () => {
    expect(toWhatsAppUrl({ display: '123', e164: '123' })).toBe('https://wa.me/123');
  });
});
