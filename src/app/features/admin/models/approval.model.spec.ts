import {
  ApprovalStatus,
  answeredFields,
  sentFields,
  toApproval,
  waitingPaths,
} from './approval.model';

describe('approval model', () => {
  const stored = {
    by: 'manager',
    email: 'm@b.c',
    paths: ['home/offer', 7],
    note: 'New dates',
    sentAt: '2026-11-19T10:00:00.000Z',
    status: 'waiting',
  };

  it('should read a stored request, ignoring paths that are not text', () => {
    expect(toApproval('r1', stored)).toEqual({
      id: 'r1',
      by: 'manager',
      email: 'm@b.c',
      paths: ['home/offer'],
      note: 'New dates',
      sentAt: '2026-11-19T10:00:00.000Z',
      status: ApprovalStatus.Waiting,
      answer: '',
      answeredAt: '',
    });
  });

  it.each([
    ['no paths', { ...stored, paths: 'home/offer' }],
    ['an unknown status', { ...stored, status: 'maybe' }],
    ['no sender', { ...stored, by: '' }],
  ])('should ignore a request with %s', (_case, fields) => {
    expect(toApproval('r1', fields)).toBeNull();
  });

  it('should store what was sent, and the answer beside it', () => {
    const approval = toApproval('r1', { ...stored, paths: ['home/offer'] })!;
    const answered = {
      ...approval,
      status: ApprovalStatus.SentBack,
      answer: 'No',
      answeredAt: 'y',
    };

    expect(sentFields(approval)).toEqual({ ...stored, paths: ['home/offer'] });
    expect(answeredFields(answered)).toEqual({
      ...stored,
      paths: ['home/offer'],
      status: 'sent-back',
      answer: 'No',
      answeredAt: 'y',
    });
  });

  it('should list the documents of waiting requests only', () => {
    const waiting = toApproval('r1', { ...stored, paths: ['home/offer'] })!;
    const answered = { ...waiting, paths: ['home/hero'], status: ApprovalStatus.Approved };

    expect([...waitingPaths([waiting, answered])]).toEqual(['home/offer']);
  });
});
