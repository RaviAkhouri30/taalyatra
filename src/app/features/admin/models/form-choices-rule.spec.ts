import fakeDb from '@core/backends/fake/fake-db.json';
import { type DocumentFields } from '@core/interfaces/i-document-store';
import { PROPOSAL_CHOICES, PROPOSAL_WORDING } from '../schemas/proposal-form.sections';
import { FormChoicesRule } from './form-choices-rule';
import { IssueSeverity } from './issue-severity.enum';

const contact = fakeDb.home.contact as unknown as DocumentFields;
const form = fakeDb.home.contact.form;

/** @returns Today's proposal section with its form changed. */
function withForm(change: Record<string, unknown>): DocumentFields {
  return { ...contact, form: { ...form, ...change } };
}

describe('FormChoicesRule', () => {
  const rule = new FormChoicesRule();

  it('should find nothing when every list starts on one of its choices', () => {
    expect(rule.check(PROPOSAL_CHOICES, contact)).toEqual([]);
  });

  it('should block publishing when a list starts on a choice it doesn’t have', () => {
    const issues = rule.check(
      PROPOSAL_CHOICES,
      withForm({ defaults: { ...form.defaults, eventType: 'Corporate' } }),
    );

    expect(issues).toEqual([
      expect.objectContaining({
        severity: IssueSeverity.Error,
        sectionId: 'contact-choices',
        field: 'Each list starts on · Event type',
        message: '“Corporate” isn’t one of the choices. Write it as one of them.',
      }),
    ]);
  });

  it('should accept “not sure” as where the experiences start', () => {
    const issues = rule.check(
      PROPOSAL_CHOICES,
      withForm({ defaults: { ...form.defaults, experience: form.experienceFallback } }),
    );

    expect(issues).toEqual([]);
  });

  it('should flag every list when the lists are missing', () => {
    expect(rule.check(PROPOSAL_CHOICES, { form: { defaults: form.defaults } })).toHaveLength(4);
  });

  it('should check only the Choices card, so a finding is listed once', () => {
    expect(rule.check(PROPOSAL_WORDING, withForm({ needs: [] }))).toEqual([]);
  });
});
