import {
  type AbstractControl,
  FormArray,
  FormControl,
  FormRecord,
  type ValidatorFn,
  Validators,
} from '@angular/forms';
import { FieldKind } from '../models/field-kind.enum';
import {
  type FieldSchema,
  type IChoiceFieldSchema,
  type IListFieldSchema,
  type INumberFieldSchema,
  type ITextFieldSchema,
} from '../models/i-field-schema';
import { emailAddressValidator, requiredTrimmedValidator } from './auth.validators';
import { dateValidator, phoneE164Validator, urlValidator } from './content.validators';
import { fieldOf } from './json-node';

/** The format check each kind of text field adds to its required and length checks. */
const FORMAT_VALIDATORS: ReadonlyMap<FieldKind, ValidatorFn> = new Map([
  [FieldKind.Url, urlValidator],
  [FieldKind.Tel, phoneE164Validator],
  [FieldKind.Email, emailAddressValidator],
  [FieldKind.Date, dateValidator],
]);

/*
 * Builds typed reactive form controls from editor schemas (ADR-0014), filled from a stored
 * document. Stored values of the wrong type fall back to safe defaults, so a damaged document
 * still opens.
 */

/**
 * @param fields The fields to edit.
 * @param source The stored object they come from (may be missing).
 * @returns One control per field, by key.
 */
export function buildFormGroup(
  fields: readonly FieldSchema[],
  source: unknown,
): FormRecord<AbstractControl> {
  return new FormRecord<AbstractControl>(
    Object.fromEntries(
      fields.map((field) => [field.key, buildControl(field, fieldOf(source, field.key))]),
    ),
  );
}

/**
 * @param field A list field.
 * @returns A control for one new, empty item.
 */
export function buildListItem(field: IListFieldSchema): AbstractControl {
  return buildControl(field.item, undefined);
}

/**
 * @param field The field.
 * @param value Its stored value.
 * @returns The field's control.
 */
export function buildControl(field: FieldSchema, value: unknown): AbstractControl {
  // The one switch on field kind: this is the controls' factory (CLAUDE.md §5).
  switch (field.kind) {
    case FieldKind.Number:
      return numberControl(field, value);
    case FieldKind.Toggle:
      // Only an explicit false is off, as on the site (ADR-0015).
      return new FormControl(value !== false, { nonNullable: true });
    case FieldKind.Choice:
      return choiceControl(field, value);
    case FieldKind.Group:
      return buildFormGroup(field.fields, value);
    case FieldKind.List:
      return new FormArray(
        (Array.isArray(value) ? value : []).map((item: unknown) => buildControl(field.item, item)),
      );
    default:
      return textControl(field, value);
  }
}

function numberControl(field: INumberFieldSchema, value: unknown): FormControl<number> {
  return new FormControl(typeof value === 'number' ? value : field.min, {
    nonNullable: true,
    validators: [requiredTrimmedValidator, Validators.min(field.min), Validators.max(field.max)],
  });
}

function choiceControl(field: IChoiceFieldSchema, value: unknown): FormControl<string> {
  const known = field.options.find((option) => option.value === value);
  return new FormControl(known?.value ?? field.options[0]?.value ?? '', { nonNullable: true });
}

function textControl(field: ITextFieldSchema, value: unknown): FormControl<string> {
  const format = FORMAT_VALIDATORS.get(field.kind);
  const validators = [
    ...(field.required ? [requiredTrimmedValidator] : []),
    ...(field.maxLength === undefined ? [] : [Validators.maxLength(field.maxLength)]),
    ...(format ? [format] : []),
  ];
  return new FormControl(typeof value === 'string' ? value : '', {
    nonNullable: true,
    validators,
  });
}
