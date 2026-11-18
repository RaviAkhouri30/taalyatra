import { LeadStatus } from '../models/lead.model';
import { createLeadFilterForm } from './lead-filter-form';

describe('createLeadFilterForm', () => {
  it('should start filtering nothing, and reset to that', () => {
    const form = createLeadFilterForm();
    form.patchValue({ status: LeadStatus.Won, search: 'Asha' });

    form.reset();

    expect(form.getRawValue()).toEqual({
      status: '',
      eventType: '',
      groupSize: '',
      month: '',
      search: '',
    });
  });
});
