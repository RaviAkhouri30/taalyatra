import { FormControl, FormGroup, type ValidatorFn } from '@angular/forms';
import {
  optionalEmailValidator,
  phoneValidator,
  requiredTextValidator,
} from './contact.validators';
import { type IProposalFormCopyDto, type ProposalField } from './i-contact';

/** Typed controls of the proposal form. */
export type ProposalControls = Record<ProposalField, FormControl<string>>;

/** The proposal form's value. */
export type ProposalValue = Readonly<Record<ProposalField, string>>;

/** @returns A text control that never resets to `null`. */
function text(value = '', validators: ValidatorFn[] = []): FormControl<string> {
  return new FormControl(value, { nonNullable: true, validators });
}

/**
 * Builds the typed proposal form (CLAUDE.md §6: typed Reactive Forms). Name and phone are
 * required; email is optional but must be valid when given.
 * @returns A new form group.
 */
export function createProposalForm(): FormGroup<ProposalControls> {
  return new FormGroup<ProposalControls>({
    need: text(),
    eventType: text(),
    experience: text(),
    groupSize: text(),
    date: text(),
    name: text('', [requiredTextValidator]),
    phone: text('', [phoneValidator]),
    email: text('', [optionalEmailValidator]),
    message: text(),
  });
}

/** Applies the copy's default selections to the dropdowns. */
export function applyDefaults(form: FormGroup<ProposalControls>, copy: IProposalFormCopyDto): void {
  form.patchValue(copy.defaults);
}
