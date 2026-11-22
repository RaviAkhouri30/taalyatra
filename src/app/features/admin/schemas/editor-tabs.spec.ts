import fakeDb from '@core/backends/fake/fake-db.json';
import { FOLD_DEFAULTS } from '@shared/constants/fold.constants';
import { HomeSection } from '@shared/enums/home-section.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { SitePage } from '@shared/enums/site-page.enum';
import { SiteWidget } from '@shared/enums/site-widget.enum';
import { ContentPath } from '../models/content-path.enum';
import { EditorTab } from '../models/editor-tab.enum';
import { FieldKind } from '../models/field-kind.enum';
import { PublishReport } from '../models/publish-report.model';
import { type FieldSchema } from '../models/i-field-schema';
import { sectionContent } from '../forms/schema-value';
import {
  ALL_SECTIONS,
  EDITOR_TABS,
  PICKABLE_SECTIONS,
  cardForAnchor,
  issueLink,
  tabSchema,
} from './editor-tabs';

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
    expect(tabSchema(EditorTab.Contact)?.label).toBe('Contact & social links');
  });

  it('should give every section a unique id', () => {
    const ids = ALL_SECTIONS.map((section) => section.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  // Drift guard (ADR-0014): every field the editor writes must exist in the stored document,
  // because firestore.rules refuses a write that changes a document's shape. Not the theme: its
  // rules allow any of its fields, and its stored document is empty, which is today's look (0021).
  it.each(
    ALL_SECTIONS.filter((section) => section.path !== ContentPath.SiteTheme).map(
      (section) => [section.id, section] as const,
    ),
  )('should only edit fields that exist in the stored document: %s', (_id, section) => {
    const stored = section.path
      .split('/')
      .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], fakeDb);
    // A collection is a list in this file, and one document holding it in a draft (D15).
    const document = Array.isArray(stored) ? { _items: stored } : stored;

    const edited = sectionContent(section, document);

    expect(keyPaths(section.fields).filter((path) => !has(edited, path))).toEqual([]);
  });

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

  it('should edit every key of each experience, which the list replaces whole', () => {
    const list = tabSchema(EditorTab.Experiences)?.sections.find(
      (section) => section.path === ContentPath.HomeExperiences && section.view !== undefined,
    )?.fields[0];
    const fields =
      list?.kind === FieldKind.List && list.item.kind === FieldKind.Group ? list.item.fields : [];
    const edited = new Set(fields.map((field) => field.key));

    for (const item of fakeDb.home.experiences.items) {
      expect(Object.keys(item).filter((key) => !edited.has(key))).toEqual([]);
    }
  });

  it('should find nothing to block in the stored experiences', () => {
    const report = PublishReport.check(
      new Map([
        [
          'home/experiences',
          { path: 'home/experiences', content: fakeDb.home.experiences, savedAt: 'x' },
        ],
      ]),
      ALL_SECTIONS,
      new Date('2026-11-05T00:00:00Z'),
    );

    expect(report.errors).toEqual([]);
  });

  it('should offer a folding choice for each foldable section, its default first', () => {
    const [visibility] = tabSchema(EditorTab.Visibility)?.sections ?? [];
    const folded = visibility?.fields.find((field) => field.key === 'folded');
    const choices = folded?.kind === FieldKind.Group ? folded.fields : [];

    expect(choices.map((choice) => choice.key)).toEqual([...FOLD_DEFAULTS.keys()]);
    const defaults = new Map<string, string>(FOLD_DEFAULTS);
    for (const choice of choices) {
      expect(choice.kind === FieldKind.Choice && choice.options[0]?.value).toBe(
        defaults.get(choice.key),
      );
    }
  });

  it('should offer a switch for every section, page and widget key', () => {
    const [visibility] = tabSchema(EditorTab.Visibility)?.sections ?? [];
    const switches = (visibility?.fields ?? []).filter((field) => field.key !== 'folded');

    expect(keyPaths(switches).sort((a, b) => a.localeCompare(b))).toEqual(
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

  it('should open the card for a clicked page section, preferring the current tab', () => {
    expect(cardForAnchor(PageAnchor.Shows)?.url).toBe('/admin/shows');
    expect(cardForAnchor(PageAnchor.DrumCircleDetails)?.fragment).toBe('card-drum-circle');
  });

  it('should open Hero, not the business details, for the top of the page', () => {
    expect(cardForAnchor(PageAnchor.Top)?.fragment).toBe('card-hero');
  });

  it('should list each clickable page section with the tab that edits it', () => {
    expect(PICKABLE_SECTIONS.get(PageAnchor.DrumCircleDetails)).toBe('Drum circle');
    expect(PICKABLE_SECTIONS.get(PageAnchor.Cities)).toBe('Where we play');
    expect(cardForAnchor('nowhere')).toBeNull();
  });
});
