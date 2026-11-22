import {
  CHAT_FORM_MAX_ITEMS,
  CHAT_FORM_MAX_LENGTH,
} from '@shared/constants/chat-form-limits.constants';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { ContentPath } from '../models/content-path.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { type FieldSchema, type IListFieldSchema } from '../models/i-field-schema';
import { groupList } from './home-parts';
import { group } from './page-parts';
import { buttonLabel, multiline, text } from './schema-fields';

const L = CHAT_FORM_MAX_LENGTH;
const MAX = CHAT_FORM_MAX_ITEMS;

/**
 * @param id The card's id.
 * @param title The card's heading.
 * @param fields Its fields.
 * @returns A card of the proposal form (`home/contact`).
 */
function card(id: string, title: string, fields: readonly FieldSchema[]): IEditorSection {
  return { id, title, path: ContentPath.HomeContact, anchor: PageAnchor.Contact, fields };
}

/** @returns A short label, required. */
function label(key: string, name: string, hint?: string): FieldSchema {
  return text(key, name, {
    required: true,
    maxLength: L.label,
    ...(hint === undefined ? {} : { hint }),
  });
}

/** @returns A sentence the form shows, required. */
function line(key: string, name: string, hint?: string): FieldSchema {
  return multiline(key, name, {
    required: true,
    maxLength: L.line,
    ...(hint === undefined ? {} : { hint }),
  });
}

/** @returns One of the form's lists of choices. */
function choices(key: string, name: string, minItems = 1): IListFieldSchema {
  return {
    key,
    label: name,
    kind: FieldKind.List,
    addLabel: 'Add choice',
    maxItems: MAX.choices,
    minItems,
    item: text('choice', 'Choice', { required: true, maxLength: L.choice }),
  };
}

/** @returns The choice a list starts on, which must be one of its choices (a publish check). */
function startsOn(key: string, name: string): FieldSchema {
  return text(key, name, {
    required: true,
    maxLength: L.choice,
    hint: 'One of the choices above, written the same way.',
  });
}

/** The lines under the form's heading (0028). */
export const PROPOSAL_PROMISES: IEditorSection = card('contact-promises', 'Promises', [
  {
    key: 'assurances',
    label: 'Promises',
    kind: FieldKind.List,
    addLabel: 'Add promise',
    maxItems: MAX.assurances,
    item: text('assurance', 'Promise', { required: true, maxLength: L.label }),
  },
]);

/** What the form offers, and where each list starts (0028). Their wording reaches Leads as sent. */
export const PROPOSAL_CHOICES: IEditorSection = card('contact-choices', 'Choices', [
  group('form', 'Choices', [
    choices('needs', 'What do you need?'),
    choices('eventTypes', 'Event types'),
    groupList('experienceGroups', ['Experiences', 'Add group', 'Group'], MAX.choiceGroups, [
      label('label', 'Group name'),
      choices('options', 'Choices'),
    ]),
    text('experienceFallback', 'Experience choice for “not sure”', {
      required: true,
      maxLength: L.choice,
    }),
    choices('groupSizes', 'Group sizes'),
    group('defaults', 'Each list starts on', [
      startsOn('need', 'What do you need?'),
      startsOn('eventType', 'Event type'),
      startsOn('experience', 'Experience'),
      startsOn('groupSize', 'Group size'),
    ]),
  ]),
]);

/** The form's labels, buttons and messages (0028). */
export const PROPOSAL_WORDING: IEditorSection = card('contact-wording', 'Form wording', [
  group('form', 'Form', [
    group('fields', 'Field labels', [
      label('need', 'What do you need?'),
      label('eventType', 'Event type'),
      label('experience', 'Experience'),
      label('groupSize', 'Group size'),
      label('date', 'Date'),
      label('name', 'Name'),
      label('phone', 'Phone'),
      label('email', 'Email'),
      label('message', 'Message'),
      label('optional', 'Beside a field you may leave empty', 'e.g. (optional)'),
    ]),
    group('placeholders', 'Before typing', [
      text('name', 'Name', { maxLength: L.label }),
      text('phone', 'Phone', { maxLength: L.label }),
      text('email', 'Email', { maxLength: L.label }),
      text('message', 'Message', { maxLength: L.label }),
    ]),
    buttonLabel('submit', 'Send button'),
    buttonLabel('sending', 'Send button, while sending'),
    buttonLabel('whatsApp', 'WhatsApp button'),
    line('finePrint', 'Line under the buttons'),
    line('sent', 'Once it’s sent'),
    line('failed', 'If it doesn’t send'),
    group('errors', 'When a field needs fixing', [
      line('name', 'Name'),
      line('phone', 'Phone'),
      line('email', 'Email'),
    ]),
  ]),
]);

/** The request as it reaches the owner by email and WhatsApp (0028). */
export const PROPOSAL_MESSAGE: IEditorSection = card('contact-message', 'Message you receive', [
  group('message', 'Message', [
    line('greeting', 'First line of a WhatsApp request'),
    label('subject', 'Email subject'),
    group('labels', 'What each answer is called', [
      label('need', 'What they need'),
      label('eventType', 'Event type'),
      label('groupSize', 'Group size'),
      label('experience', 'Experience'),
      label('date', 'Date'),
      label('name', 'Name'),
      label('phone', 'Phone'),
      label('email', 'Email'),
    ]),
  ]),
]);

/** @returns A "Prefer to talk?" row: its title and detail line. */
function row(key: string, name: string, hint: string): FieldSchema {
  return group(key, name, [label('title', 'Title'), label('detail', 'Detail', hint)]);
}

/** The box beside the form (0028). */
export const PROPOSAL_ASIDE: IEditorSection = card('contact-aside', 'Prefer to talk?', [
  group('aside', 'Box beside the form', [
    label('title', 'Title'),
    row('whatsApp', 'WhatsApp', '{phone} becomes your number.'),
    row('call', 'Call', '{hours} and {phone} become your opening hours and number.'),
    row('email', 'Email', '{email} becomes your email address.'),
    label('noteTitle', 'Note’s title'),
    line('noteText', 'Note'),
  ]),
]);
