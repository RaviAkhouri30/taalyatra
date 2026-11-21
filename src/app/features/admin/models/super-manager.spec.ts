import {
  type ISuperManager,
  isSuperActive,
  superManagerFields,
  superNotice,
  superUntil,
  toSuperManager,
  untilDay,
} from './super-manager';

const UNTIL_30_NOV = Date.parse('2026-11-30T18:30:00Z');

describe('super manager (0024)', () => {
  it('should end at midnight in India at the start of the next day', () => {
    expect(superUntil('2026-11-30')).toBe(UNTIL_30_NOV);
  });

  it('should give back the last day it lasts', () => {
    expect(untilDay(superUntil('2026-11-30'))).toBe('2026-11-30');
  });

  it.each([
    ['for good', null, '2030-01-01T00:00:00Z', true],
    ['before its end', UNTIL_30_NOV, '2026-11-30T18:29:59Z', true],
    ['at its end', UNTIL_30_NOV, '2026-11-30T18:30:00Z', false],
    ['after its end', UNTIL_30_NOV, '2026-12-02T00:00:00Z', false],
  ])('should judge one %s', (_case, untilMs, now, running) => {
    const entry: ISuperManager = { since: 'x', untilMs };

    expect(isSuperActive(entry, new Date(now))).toBe(running);
  });

  it('should make no one super without an entry', () => {
    expect(isSuperActive(undefined, new Date(0))).toBe(false);
  });

  it('should read a stored entry, for good or with an end', () => {
    expect(toSuperManager({ since: 's', untilMs: null })).toEqual({ since: 's', untilMs: null });
    expect(toSuperManager({ since: 's', untilMs: 5 })).toEqual({ since: 's', untilMs: 5 });
  });

  it.each([
    ['nothing', undefined],
    ['not a map', 'yes'],
    ['no start', { untilMs: null }],
    ['an end that isn’t a number', { since: 's', untilMs: '2026-11-30' }],
    ['an end that isn’t finite', { since: 's', untilMs: Number.NaN }],
  ])('should read no entry from %s', (_case, value) => {
    expect(toSuperManager(value)).toBeUndefined();
  });

  it('should store an entry in the shape the rules accept', () => {
    expect(superManagerFields({ since: 's', untilMs: 5 })).toEqual({ since: 's', untilMs: 5 });
  });

  describe('the dashboard notice', () => {
    const end = new Date(UNTIL_30_NOV);
    const DAY = 86_400_000;

    it.each([
      [
        'for good',
        null,
        UNTIL_30_NOV,
        'You’re a super manager: you approve changes for the owner.',
      ],
      [
        'more than three days before the end',
        end,
        UNTIL_30_NOV - 3 * DAY - 1,
        'You’re a super manager until 30 Nov 2026: you approve changes for the owner.',
      ],
      [
        'three days before the end',
        end,
        UNTIL_30_NOV - 3 * DAY,
        'Your super manager access ends on 30 Nov 2026.',
      ],
    ])('should say %s', (_case, endsAt, now, text) => {
      expect(superNotice(true, endsAt, new Date(now))).toBe(text);
    });

    it('should say nothing to anyone else', () => {
      expect(superNotice(false, null, end)).toBe('');
    });
  });
});
