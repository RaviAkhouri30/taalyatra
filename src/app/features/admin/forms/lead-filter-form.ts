import { FormControl, FormGroup } from '@angular/forms';
import { type LeadStatus } from '../models/lead.model';

/** Typed controls of the Leads page's filters (0018 V12). */
export interface ILeadFilterControls {
  readonly status: FormControl<LeadStatus | ''>;
  readonly eventType: FormControl<string>;
  readonly groupSize: FormControl<string>;
  readonly month: FormControl<string>;
  readonly search: FormControl<string>;
}

function choice<T extends string>(): FormControl<T | ''> {
  return new FormControl<T | ''>('', { nonNullable: true });
}

/** @returns A new filter form, filtering nothing. No validators: every value is a valid filter. */
export function createLeadFilterForm(): FormGroup<ILeadFilterControls> {
  return new FormGroup<ILeadFilterControls>({
    status: choice<LeadStatus>(),
    eventType: choice(),
    groupSize: choice(),
    month: choice(),
    search: choice(),
  });
}
