import fakeDb from '@core/backends/fake/fake-db.json';
import { HomeSection } from '@shared/enums/home-section.enum';
import { SitePage } from '@shared/enums/site-page.enum';
import { SiteWidget } from '@shared/enums/site-widget.enum';
import { EditorTab } from '../models/editor-tab.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type FieldSchema } from '../models/i-field-schema';
import { ALL_SECTIONS, EDITOR_TABS, issueLink, tabSchema } from './editor-tabs';

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
      const stored = section.path
        .split('/')
        .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], fakeDb);
      // A collection is a list in this file, and one document holding it in a draft (D15).
      const document = Array.isArray(stored) ? { _items: stored } : stored;

      expect(keyPaths(section.fields).filter((path) => !has(document, path))).toEqual([]);
    },
  );

  // A collection's list replaces each item whole, and firestore.rules requires exact keys, so a
  // key missing from a schema would make every publish of that collection fail.
  it.each([
    [EditorTab.Team, fakeDb.team],
    [EditorTab.Shows, fakeDb.showFormats],
    [EditorTab.Videos, fakeDb.videos],
  ])('should edit every key of each item on the %s tab', (tab, items) => {
    const list = tabSchema(tab)?.sections.at(-1)?.fields[0];
    const fields =
      list?.kind === FieldKind.List && list.item.kind === FieldKind.Group ? list.item.fields : [];

    for (const item of items) {
      expect(new Set(fields.map((field) => field.key))).toEqual(new Set(Object.keys(item)));
    }
  });

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

  it('should have no link for a section no tab edits', () => {
    expect(issueLink('gone')).toBeNull();
  });
});
