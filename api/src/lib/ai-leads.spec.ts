import { firstValueFrom } from 'rxjs';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  AI_ENV,
  type ITestKeys,
  aiAnswer,
  createTestKeys,
  fakeDependencies,
  fakeRequest,
  roleDocument,
  signToken,
} from '../testing/api-testing.js';
import { BAD_AI_REQUEST } from './ai-request.js';
import { leadsAnalysis, summaryOf } from './ai-leads.js';

const SUMMARY = {
  total: 3,
  byStatus: { new: 2, won: 1 },
  byEventType: { Corporate: 2, School: 1 },
  byExperience: {},
  byGroupSize: { '20–50': 3 },
  byEventMonth: { '2026-12': 2 },
  byReceivedMonth: { '2026-11': 3 },
};

describe('leadsAnalysis', () => {
  let test: ITestKeys;

  beforeAll(async () => {
    test = await createTestKeys();
  });

  it('should analyse the counts for the owner, sending only the summary', async () => {
    const post = vi.fn(() => Promise.resolve(aiAnswer('• Corporate events lead.')));
    const token = await signToken(test.privateKey);
    const deps = fakeDependencies(test.keys, { env: AI_ENV, post });

    const response = await firstValueFrom(
      leadsAnalysis(fakeRequest(token, { summary: SUMMARY }), deps),
    );

    expect(response).toMatchObject({ status: 200, jsonBody: { text: '• Corporate events lead.' } });
    const sent = post.mock.calls[0] as unknown as [
      string,
      unknown,
      { messages: { content: string }[] },
    ];
    expect(JSON.parse(sent[2].messages[1]?.content ?? '{}')).toEqual(SUMMARY);
  });

  it('should refuse a manager without Leads, and help one with them', async () => {
    const token = await signToken(test.privateKey, { sub: 'manager' });
    const withLeads = roleDocument({
      areas: { mapValue: { fields: { leads: { booleanValue: true } } } },
    });
    const run = (document: Response) =>
      firstValueFrom(
        leadsAnalysis(
          fakeRequest(token, { summary: SUMMARY }),
          fakeDependencies(test.keys, {
            env: AI_ENV,
            read: vi.fn(() => Promise.resolve(document)),
          }),
        ),
      );

    await expect(run(roleDocument())).rejects.toMatchObject({ status: 403 });
    await expect(run(withLeads)).resolves.toMatchObject({ status: 200 });
  });

  it('should say the help is unavailable without settings', async () => {
    const token = await signToken(test.privateKey);

    await expect(
      firstValueFrom(
        leadsAnalysis(fakeRequest(token, { summary: SUMMARY }), fakeDependencies(test.keys)),
      ),
    ).rejects.toMatchObject({ status: 503 });
  });
});

describe('summaryOf', () => {
  it('should rebuild the summary from the expected counts', () => {
    expect(summaryOf({ summary: SUMMARY })).toEqual(SUMMARY);
  });

  it.each([
    ['a name', { ...SUMMARY, name: 'Asha' }],
    ['a missing group', { ...SUMMARY, byStatus: undefined }],
    ['a group that isn’t a map', { ...SUMMARY, byStatus: ['new'] }],
    ['a count that isn’t a whole number', { ...SUMMARY, byStatus: { new: 'two' } }],
    ['a negative total', { ...SUMMARY, total: -1 }],
    ['a label that’s too long', { ...SUMMARY, byEventType: { ['x'.repeat(61)]: 1 } }],
    [
      'too many labels',
      {
        ...SUMMARY,
        byEventType: Object.fromEntries(
          Array.from({ length: 41 }, (_v, i) => [`t${String(i)}`, 1]),
        ),
      },
    ],
  ])('should refuse a summary with %s', (_case, summary) => {
    expect(() => summaryOf({ summary })).toThrow(BAD_AI_REQUEST);
  });

  it('should refuse anything beside the summary', () => {
    expect(() => summaryOf({ summary: SUMMARY, leads: [] })).toThrow(BAD_AI_REQUEST);
  });
});
