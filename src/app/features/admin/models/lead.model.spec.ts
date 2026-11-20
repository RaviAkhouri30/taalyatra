import { Lead, LeadStatus, leadStatusLabel, newestFirst, toLeadStatus } from './lead.model';

describe('Lead', () => {
  const stored = {
    name: ' Asha ',
    phone: '98200 12345',
    email: 'asha@example.com',
    eventType: 'Corporate',
    message: 'Hello',
    // 18 Nov 2026, 10:30 am in Pune.
    createdAt: { seconds: Date.parse('2026-11-18T05:00:00Z') / 1000 },
  };

  it('should read a proposal from before statuses as new', () => {
    const lead = new Lead('a', stored);

    expect(lead.name).toBe('Asha');
    expect(lead.status).toBe(LeadStatus.New);
    expect(lead.day).toBe('2026-11-18');
    expect(lead.month).toBe('2026-11');
    expect(lead.received).toBe('18 Nov 2026, 10:30 am');
  });

  it('should keep a known status, and treat an unknown one as new', () => {
    expect(new Lead('a', { ...stored, status: 'won' }).status).toBe(LeadStatus.Won);
    expect(new Lead('a', { ...stored, status: 'maybe' }).status).toBe(LeadStatus.New);
  });

  it('should add India’s code to a ten-digit number for calls and WhatsApp', () => {
    const lead = new Lead('a', stored);

    expect(lead.callLink).toBe('tel:+919820012345');
    expect(lead.whatsAppLink).toBe('https://wa.me/919820012345');
    expect(lead.mailLink).toBe('mailto:asha@example.com');
  });

  it('should keep a number that already has its country code', () => {
    expect(new Lead('a', { phone: '+44 20 7946 0958' }).callLink).toBe('tel:+442079460958');
  });

  it('should give no links without a phone or email, and say when the date is unknown', () => {
    const lead = new Lead('a', { name: 'Ravi' });

    expect([lead.callLink, lead.whatsAppLink, lead.mailLink]).toEqual(['', '', '']);
    expect(lead.received).toBe('Date not known');
    expect(lead.month).toBe('');
  });

  it('should list leads newest first, those without a date last', () => {
    const leads = newestFirst([
      new Lead('old', { createdAt: { seconds: 1 } }),
      new Lead('none', {}),
      new Lead('new', { createdAt: { seconds: 2 } }),
    ]);

    expect(leads.map((lead) => lead.id)).toEqual(['new', 'old', 'none']);
  });

  it('should name statuses, and read only known ones', () => {
    expect(leadStatusLabel(LeadStatus.Contacted)).toBe('Contacted');
    expect(toLeadStatus('lost')).toBe(LeadStatus.Lost);
    expect(toLeadStatus('')).toBeUndefined();
  });

  describe('statusLine', () => {
    const signed = { status: 'contacted', statusBy: 'p@b.c', statusAt: '2026-11-21T05:12:00.000Z' };

    it('should say who changed the status and when', () => {
      expect(new Lead('a', signed).statusLine('o@b.c')).toMatch(
        /^Contacted by p@b\.c, 21 Nov 2026/,
      );
    });

    it('should say "by you" for the viewer’s own change', () => {
      expect(new Lead('a', signed).statusLine('p@b.c')).toMatch(/^Contacted by you, /);
    });

    it('should leave the time out when it isn’t known', () => {
      expect(new Lead('a', { ...signed, statusAt: '' }).statusLine('x')).toBe('Contacted by p@b.c');
    });

    it('should say nothing when nobody signed the status', () => {
      expect(new Lead('a', { status: 'won' }).statusLine('o@b.c')).toBe('');
    });
  });
});
