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
import { multiline, text } from './schema-fields';

const L = CHAT_FORM_MAX_LENGTH;

/**
 * @param id The card's id.
 * @param title The card's heading.
 * @param fields Its fields.
 * @param tip A writing tip, if any.
 * @returns A card of the chat assistant's script (`home/assistant`).
 */
function card(
  id: string,
  title: string,
  fields: readonly FieldSchema[],
  tip?: string,
): IEditorSection {
  return {
    id,
    title,
    path: ContentPath.HomeAssistant,
    anchor: PageAnchor.Top,
    fields,
    ...(tip === undefined ? {} : { tip }),
  };
}

/** @returns A short label, required. */
function label(key: string, name: string): FieldSchema {
  return text(key, name, { required: true, maxLength: L.label });
}

/** The words that bring up an answer: lower or upper case, the site compares without case. */
const KEYWORDS: IListFieldSchema = {
  key: 'keywords',
  label: 'Words that bring it up',
  kind: FieldKind.List,
  addLabel: 'Add word',
  maxItems: CHAT_FORM_MAX_ITEMS.keywords,
  minItems: 1,
  item: text('keyword', 'Word', { required: true, maxLength: L.keyword }),
};

/** The chat assistant's script (0028), on its own editor page. */
export const CHAT_SECTIONS: readonly IEditorSection[] = [
  card('chat-window', 'Chat window', [
    label('title', 'Title'),
    text('status', 'Line under the title', { maxLength: L.label }),
    multiline('greeting', 'Greeting', { required: true, maxLength: L.message }),
    text('tease', 'Bubble beside the chat button', { maxLength: L.line }),
    text('whatsAppLink', 'WhatsApp line under the answers', { required: true, maxLength: L.line }),
    multiline('fallback', 'Answer when nothing matches', {
      required: true,
      maxLength: L.message,
    }),
  ]),
  card('chat-quick', 'Quick questions', [
    {
      key: 'quickReplies',
      label: 'Questions',
      kind: FieldKind.List,
      addLabel: 'Add question',
      maxItems: CHAT_FORM_MAX_ITEMS.quickReplies,
      item: text('question', 'Question', { required: true, maxLength: L.keyword }),
    },
  ]),
  card(
    'chat-answers',
    'Answers',
    [
      groupList('replies', ['Answers', 'Add answer', 'Answer'], CHAT_FORM_MAX_ITEMS.replies, [
        KEYWORDS,
        multiline('text', 'Answer', {
          required: true,
          maxLength: L.message,
          hint: '{email} becomes your email address.',
        }),
      ]),
    ],
    'The chat gives the first answer with one of its words in the question, so put the more specific answers first.',
  ),
  card('chat-labels', 'Screen reader words', [
    group('labels', 'What the chat’s parts are called', [
      label('toggle', 'Chat button'),
      label('close', 'Close button'),
      label('call', 'Call button'),
      label('whatsApp', 'WhatsApp button'),
      label('typing', 'While the answer is being written'),
      label('messages', 'The conversation'),
      label('input', 'Question box'),
      text('placeholder', 'Question box, before typing', { maxLength: L.label }),
      label('send', 'Send button'),
    ]),
  ]),
];
