import { FormControl, FormGroup, type ValidatorFn, Validators } from '@angular/forms';
import {
  optionalEmailValidator,
  phoneValidator,
  requiredTextValidator,
} from './contact.validators';
import { type IProposalFormCopyDto, type ProposalField } from './i-contact';
import { PROPOSAL_MAX_LENGTH as MAX } from './proposal-limits.constants';

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
 * required; email is optional but must be valid when given. Every field has the same maximum
 * length that `firestore.rules` enforces.
 * @returns A new form group.
 */
export function createProposalForm(): FormGroup<ProposalControls> {
  return new FormGroup<ProposalControls>({
    need: text('', [Validators.maxLength(MAX.need)]),
    eventType: text('', [Validators.maxLength(MAX.eventType)]),
    experience: text('', [Validators.maxLength(MAX.experience)]),
    groupSize: text('', [Validators.maxLength(MAX.groupSize)]),
    date: text('', [Validators.maxLength(MAX.date)]),
    name: text('', [requiredTextValidator, Validators.maxLength(MAX.name)]),
    phone: text('', [phoneValidator, Validators.maxLength(MAX.phone)]),
    email: text('', [optionalEmailValidator, Validators.maxLength(MAX.email)]),
    message: text('', [Validators.maxLength(MAX.message)]),
  });
}

/** Applies the copy's default selections to the dropdowns. */
export function applyDefaults(form: FormGroup<ProposalControls>, copy: IProposalFormCopyDto): void {
  form.patchValue(copy.defaults);
}
