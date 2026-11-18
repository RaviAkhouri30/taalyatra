import { Lead, LeadStatus } from './lead.model';
import {
  NO_LEAD_FILTER,
  filterLeads,
  filterOptions,
  leadsCsv,
  leadsCsvName,
} from './leads-page.model';

describe('Leads page', () => {
  const at = (iso: string) => ({ seconds: Date.parse(iso) / 1000 });
  const leads = [
    new Lead('a', {
      name: 'Asha Rao',
      phone: '98200 12345',
      email: 'asha@example.com',
      eventType: 'Corporate',
      groupSize: '50–100',
      createdAt: at('2026-11-18T05:00:00Z'),
    }),
    new Lead('b', {
      name: 'Ravi',
      phone: '91234 56789',
      email: 'ravi@example.com',
      eventType: 'Wedding',
      groupSize: '10–50',
      status: 'won',
      createdAt: at('2026-10-02T05:00:00Z'),
    }),
  ];
  const ids = (shown: readonly Lead[]) => shown.map((lead) => lead.id);

  it('should show every lead with no filter', () => {
    expect(ids(filterLeads(leads, NO_LEAD_FILTER))).toEqual(['a', 'b']);
  });

  it.each([
    ['status', { status: LeadStatus.Won }, ['b']],
    ['event', { eventType: 'Corporate' }, ['a']],
    ['group size', { groupSize: '10–50' }, ['b']],
    ['month', { month: '2026-11' }, ['a']],
    ['part of a name, any case', { search: 'RAO' }, ['a']],
    ['an email', { search: 'ravi@' }, ['b']],
    ['phone digits, spaced differently', { search: '9820012' }, ['a']],
  ])('should filter by %s', (_case, change, expected) => {
    expect(ids(filterLeads(leads, { ...NO_LEAD_FILTER, ...change }))).toEqual(expected);
  });

  it('should offer only choices some lead has, newest month first', () => {
    const options = filterOptions([...leads, new Lead('c', { name: 'No details' })]);

    expect(options.eventTypes.map((option) => option.value)).toEqual(['Corporate', 'Wedding']);
    expect(options.months).toEqual([
      { value: '2026-11', label: 'November 2026' },
      { value: '2026-10', label: 'October 2026' },
    ]);
  });

  it('should write a CSV with a heading row, every cell quoted', () => {
    const csv = leadsCsv([leads[1]!]);
    const [heading, row] = csv.replace('﻿', '').split('\r\n');

    expect(heading).toMatch(/^"Received","Status","Name","Phone","Email"/);
    expect(row).toContain('"Won","Ravi","91234 56789","ravi@example.com"');
  });

  it('should keep a visitor’s formula-like text as plain text, and escape quotes', () => {
    const csv = leadsCsv([
      new Lead('x', { name: '=HYPERLINK("http://evil")', message: '+1 say "hi"' }),
    ]);

    expect(csv).toContain(`"'=HYPERLINK(""http://evil"")"`);
    expect(csv).toContain(`"'+1 say ""hi"""`);
  });

  it('should start with the mark spreadsheets need to read UTF-8', () => {
    expect(leadsCsv([]).startsWith('﻿')).toBe(true);
  });

  it('should name the file by date', () => {
    expect(leadsCsvName(new Date('2026-11-18T05:00:00Z'))).toBe('taal-yatra-leads-2026-11-18.csv');
  });
});
