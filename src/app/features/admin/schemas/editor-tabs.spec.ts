import fakeDb from '@core/backends/fake/fake-db.json';
import { HomeSection } from '@shared/enums/home-section.enum';
import { SitePage } from '@shared/enums/site-page.enum';
import { SiteWidget } from '@shared/enums/site-widget.enum';
import { EditorTab } from '../models/editor-tab.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type FieldSchema } from '../models/i-field-schema';
import { ALL_SECTIONS, EDITOR_TABS, tabSchema } from './editor-tabs';

/** Every stored key a field list edits, as paths into the document (`contact.phone.e164`). */
function keyPaths(fields: readonly FieldSchema[], prefix = ''): string[] {
  return fields.flatMap((field) =>
    field.kind === FieldKind.Group
      ? keyPaths(field.fields, `${prefix}${field.key}.`)
      : [`${prefix}${field.key}`],
  );
}

function has(document: unknown, path: string): boolean {
  return path.split('.').reduce<{ found: boolean; node: unknown }>(
    (state, key) => {
      const node = state.node as Record<string, unknown> | null;
      return typeof node === 'object' && node !== null && key in node
        ? { found: state.found, node: node[key] }
        : { found: false, node: undefined };
    },
    { found: true, node: document },
  ).found;
}

describe('editor schemas', () => {
  it('should have one schema per tab, in menu order', () => {
    expect(EDITOR_TABS.map((entry) => entry.tab)).toEqual(Object.values(EditorTab));
    expect(tabSchema(EditorTab.Contact)?.label).toBe('Contact & links');
  });

  it('should give every section a unique id', () => {
    const ids = ALL_SECTIONS.map((section) => section.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  // Drift guard (ADR-0014): every field the editor writes must exist in the stored document,
  // because firestore.rules refuses a write that changes a document's shape.
  it.each(ALL_SECTIONS.map((section) => [section.id, section] as const))(
    'should only edit fields that exist in the stored document: %s',
    (_id, section) => {
      const document = section.path
        .split('/')
        .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], fakeDb);

      expect(keyPaths(section.fields).filter((path) => !has(document, path))).toEqual([]);
    },
  );

  it('should offer a switch for every section, page and widget key', () => {
    const [visibility] = tabSchema(EditorTab.Visibility)?.sections ?? [];

    expect(keyPaths(visibility?.fields ?? []).sort((a, b) => a.localeCompare(b))).toEqual(
      [
        ...Object.values(HomeSection).map((key) => `sections.${key}`),
        ...Object.values(SitePage).map((key) => `pages.${key}`),
        ...Object.values(SiteWidget).map((key) => `widgets.${key}`),
      ].sort((a, b) => a.localeCompare(b)),
    );
  });
});
