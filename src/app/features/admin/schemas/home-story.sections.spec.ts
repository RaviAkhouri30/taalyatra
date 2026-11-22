import fakeDb from '@core/backends/fake/fake-db.json';
import { buildFormGroup } from '../forms/schema-control.factory';
import { ContentPath } from '../models/content-path.enum';
import { EditorTab } from '../models/editor-tab.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { tabSchema } from './editor-tabs';
import {
  AUDIENCE_CARDS_SECTION,
  MARQUEE_SECTION,
  PHILOSOPHY_SECTIONS,
  TRUST_SECTION,
} from './home-story.sections';

const home = fakeDb.home as unknown as Record<string, unknown>;

/** @returns The section's document as the editor reads it: a list inside `{ _items }`. */
function stored(path: ContentPath): Record<string, unknown> {
  const value = home[path.replace('home/', '')];
  return Array.isArray(value) ? { _items: value } : (value as Record<string, unknown>);
}

const NEW_SECTIONS: readonly IEditorSection[] = [
  MARQUEE_SECTION,
  TRUST_SECTION,
  AUDIENCE_CARDS_SECTION,
  ...PHILOSOPHY_SECTIONS,
];

/** The home sections of 2.10.0 on Hero, Who it's for and Our philosophy (0028). */
describe('home story schemas', () => {
  it.each(NEW_SECTIONS.map((section) => [section.id, section]))(
    'should hold today’s content of %s unchanged when it is loaded into its form',
    (_id, section) => {
      const document = stored(section.path);

      const values = buildFormGroup(section.fields, document).getRawValue();

      for (const field of section.fields) {
        expect(values[field.key], field.key).toEqual(document[field.key]);
      }
    },
  );

  it.each([
    ContentPath.HomeMarquee,
    ContentPath.HomeTrust,
    ContentPath.HomePhilosophy,
    ContentPath.HomeMidCta,
  ])('should leave no part of %s without a field', (path) => {
    const covered = new Set(
      NEW_SECTIONS.filter((section) => section.path === path).flatMap((section) =>
        section.fields.map((field) => field.key),
      ),
    );

    expect(Object.keys(stored(path)).filter((key) => !covered.has(key))).toEqual([]);
  });

  it('should leave none of the audience cards’ document without a field, with the heading', () => {
    const covered = new Set(
      (tabSchema(EditorTab.Audiences)?.sections ?? []).flatMap((section) =>
        section.fields.map((field) => field.key),
      ),
    );

    expect(
      Object.keys(stored(ContentPath.HomeAudiences)).filter((key) => !covered.has(key)),
    ).toEqual([]);
  });

  it.each([
    [EditorTab.Hero, ['hero', 'marquee', 'trust']],
    [EditorTab.Philosophy, ['philosophy', 'philosophy-goals', 'philosophy-journey', 'mid-cta']],
  ])('should put the right cards on %s', (tab, ids) => {
    expect(tabSchema(tab)?.sections.map((section) => section.id)).toEqual(ids);
  });
});
