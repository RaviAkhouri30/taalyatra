import { Lead, LeadStatus } from './lead.model';
import { countLabels, leadsSummary } from './leads-summary';

const lead = (fields: Record<string, unknown>) =>
  new Lead('id', {
    name: 'Asha Rao',
    phone: '+919876543210',
    email: 'asha@example.com',
    need: 'Please call me at home',
    message: 'My address is 12 MG Road',
    createdAt: { seconds: 1_793_577_600 },
    ...fields,
  });

describe('leadsSummary (0025 V12)', () => {
  const leads = [
    lead({
      eventType: 'Corporate',
      groupSize: '20–50',
      experience: 'Drum circle',
      date: '2026-12-05',
    }),
    lead({ eventType: 'Corporate', groupSize: '50+', date: 'next month', status: LeadStatus.Won }),
    lead({ eventType: 'School' }),
  ];

  it('should count each group, with "Not given" for what’s missing', () => {
    expect(leadsSummary(leads)).toEqual({
      total: 3,
      byStatus: { new: 2, won: 1 },
      byEventType: { Corporate: 2, School: 1 },
      byExperience: { 'Not given': 2, 'Drum circle': 1 },
      byGroupSize: { '20–50': 1, '50+': 1, 'Not given': 1 },
      byEventMonth: { 'Not given': 2, '2026-12': 1 },
      byReceivedMonth: { '2026-11': 3 },
    });
  });

  it('should never contain a name, phone, email, need or message', () => {
    const sent = JSON.stringify(leadsSummary(leads));

    for (const personal of ['Asha', '98765', 'example.com', 'call me', 'MG Road', 'next month']) {
      expect(sent).not.toContain(personal);
    }
  });

  it('should keep the most common labels and count the rest as "Other", within the limits', () => {
    const labels = [
      ...Array.from({ length: 45 }, (_value, index) => `Type ${String(index)}`),
      'Type 0',
      'x'.repeat(80),
    ];

    const counts = countLabels(labels);

    expect(Object.keys(counts)).toHaveLength(40);
    expect(counts['Type 0']).toBe(2);
    expect(counts['Other']).toBe(7);
    expect(Object.keys(counts).every((label) => label.length <= 60)).toBe(true);
  });
});
