import fakeDb from '@core/backends/fake/fake-db.json';
import { buildFormGroup } from '../forms/schema-control.factory';
import { ContentPath } from '../models/content-path.enum';
import { EditorTab } from '../models/editor-tab.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { type FieldSchema } from '../models/i-field-schema';
import { CHAT_SECTIONS } from './chat.sections';
import { tabSchema } from './editor-tabs';

const home = fakeDb.home as unknown as Record<string, Record<string, unknown>>;

/** @returns Every stored value's path, objects opened, lists as one value (`form.fields.name`). */
function storedPaths(value: unknown, prefix = ''): string[] {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? Object.entries(value).flatMap(([key, inner]) => storedPaths(inner, `${prefix}${key}.`))
    : [prefix.slice(0, -1)];
}

/** @returns Every path a field list edits, groups opened. */
function editedPaths(fields: readonly FieldSchema[], prefix = ''): string[] {
  return fields.flatMap((field) =>
    field.kind === FieldKind.Group
      ? editedPaths(field.fields, `${prefix}${field.key}.`)
      : [`${prefix}${field.key}`],
  );
}

/** @returns The sections a tab has on one document. */
function sectionsOf(tab: EditorTab, path: ContentPath): readonly IEditorSection[] {
  return (tabSchema(tab)?.sections ?? []).filter((section) => section.path === path);
}

/** The chat assistant's script and the proposal form, editable since 2.12.0 (0028). */
describe('chat and proposal form schemas', () => {
  it.each([
    [EditorTab.Chat, ContentPath.HomeAssistant, 'assistant'],
    [EditorTab.ProposalForm, ContentPath.HomeContact, 'contact'],
  ])('should leave no part of %s’s document without a field', (tab, path, key) => {
    const edited = new Set(sectionsOf(tab, path).flatMap((section) => editedPaths(section.fields)));

    expect(storedPaths(home[key]).filter((stored) => !edited.has(stored))).toEqual([]);
  });

  it.each(
    [
      ...sectionsOf(EditorTab.Chat, ContentPath.HomeAssistant),
      ...sectionsOf(EditorTab.ProposalForm, ContentPath.HomeContact),
    ].map((section) => [section.id, section] as const),
  )(
    'should hold today’s content of %s unchanged when it is loaded into its form',
    (_id, section) => {
      const document =
        section.path === ContentPath.HomeAssistant ? home['assistant'] : home['contact'];
      const values = buildFormGroup(section.fields, document).getRawValue();

      for (const path of editedPaths(section.fields)) {
        const read = (node: unknown): unknown =>
          path.split('.').reduce<unknown>((at, key) => (at as Record<string, unknown>)[key], node);
        expect(read(values), path).toEqual(read(document));
      }
    },
  );

  it('should put the chat’s cards on its own page, in the order the chat shows them', () => {
    expect(CHAT_SECTIONS.map((section) => section.id)).toEqual([
      'chat-window',
      'chat-quick',
      'chat-answers',
      'chat-labels',
    ]);
  });

  it('should hold every answer today to the limits', () => {
    const replies = (home['assistant']?.['replies'] ?? []) as { keywords: string[] }[];

    expect(replies.length).toBeLessThanOrEqual(30);
    expect(Math.max(...replies.map((reply) => reply.keywords.length))).toBeLessThanOrEqual(12);
  });
});
