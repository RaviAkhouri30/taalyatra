import { CONTENT_MAX_LENGTH } from '@shared/constants/content-limits.constants';
import { FieldKind } from '../models/field-kind.enum';
import { type ITextFieldSchema } from '../models/i-field-schema';

/** Button labels stay short so buttons keep to one line on phones. */
export const BUTTON_LABEL_MAX = 40;

/**
 * @param key The stored key.
 * @param label The visible label.
 * @param options Anything else (required, limits, hint).
 * @returns A single-line text field.
 */
export function text(
  key: string,
  label: string,
  options: Omit<ITextFieldSchema, 'key' | 'label' | 'kind'> = {},
): ITextFieldSchema {
  return { key, label, kind: FieldKind.Text, ...options };
}

/**
 * @param key The stored key.
 * @param label The visible label.
 * @param options Anything else (required, limits, hint).
 * @returns A multi-line text field.
 */
export function multiline(
  key: string,
  label: string,
  options: Omit<ITextFieldSchema, 'key' | 'label' | 'kind'> = {},
): ITextFieldSchema {
  return { key, label, kind: FieldKind.Multiline, ...options };
}

/**
 * @param key The stored key.
 * @param label The visible label.
 * @returns A button label field.
 */
export function buttonLabel(key: string, label: string): ITextFieldSchema {
  return text(key, label, { required: true, maxLength: BUTTON_LABEL_MAX });
}

/** The heading fields most home sections share: eyebrow, title and lead. */
export const HEADING_FIELDS = {
  eyebrow: text('eyebrow', 'Small heading above the title', {
    maxLength: CONTENT_MAX_LENGTH.eyebrow,
  }),
  title: text('title', 'Title', {
    required: true,
    maxLength: CONTENT_MAX_LENGTH.title,
    recommended: 50,
    hint: 'One short sentence reads best.',
  }),
  lead: multiline('lead', 'Introduction', { maxLength: CONTENT_MAX_LENGTH.lead }),
} as const;
