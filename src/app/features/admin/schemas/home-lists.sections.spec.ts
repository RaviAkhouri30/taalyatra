import { HOME_MAX_ITEMS } from '@shared/constants/home-content-limits.constants';
import fakeDb from '@core/backends/fake/fake-db.json';
import { buildFormGroup } from '../forms/schema-control.factory';
import { ContentPath } from '../models/content-path.enum';
import { EditorTab } from '../models/editor-tab.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { type IListFieldSchema } from '../models/i-field-schema';
import { tabSchema } from './editor-tabs';
import {
  CITIES_SECTION,
  FAQ_SECTION,
  HOW_SECTION,
  INSTAGRAM_SECTION,
  TESTIMONIALS_SECTIONS,
} from './home-lists.sections';

const home = fakeDb.home as unknown as Record<string, unknown>;

/** @returns The section's document as the editor reads it: a list inside `{ _items }`. */
function stored(path: ContentPath): Record<string, unknown> {
  const value = home[path.replace('home/', '')];
  return Array.isArray(value) ? { _items: value } : (value as Record<string, unknown>);
}

const NEW_SECTIONS: readonly IEditorSection[] = [
  CITIES_SECTION,
  HOW_SECTION,
  INSTAGRAM_SECTION,
  ...TESTIMONIALS_SECTIONS,
  FAQ_SECTION,
];

/** The home sections of 2.10.0 with lists of their own (0028). */
describe('home list schemas', () => {
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
    ContentPath.HomeCities,
    ContentPath.HomeHow,
    ContentPath.HomeInstagram,
    ContentPath.HomeProof,
    ContentPath.HomeFaq,
  ])('should leave no part of %s without a field', (path) => {
    const covered = new Set(
      NEW_SECTIONS.filter((section) => section.path === path).flatMap((section) =>
        section.fields.map((field) => field.key),
      ),
    );

    expect(Object.keys(stored(path)).filter((key) => !covered.has(key))).toEqual([]);
  });

  it('should hold each list to its limit when it is today’s length or longer', () => {
    const faq = FAQ_SECTION.fields.find((field) => field.key === 'items') as IListFieldSchema;

    expect(faq.maxItems).toBe(HOME_MAX_ITEMS.faq);
    expect((home['faq'] as { items: unknown[] }).items.length).toBeLessThanOrEqual(faq.maxItems);
  });

  it.each([[EditorTab.Testimonials, ['proof', 'proof-testimonials', 'proof-clients']]])(
    'should put the right cards on %s',
    (tab, ids) => {
      expect(tabSchema(tab)?.sections.map((section) => section.id)).toEqual(ids);
    },
  );
});
