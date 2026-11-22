import fakeDb from '@core/backends/fake/fake-db.json';
import { AppRoute } from '@shared/enums/app-route.enum';
import { buildFormGroup } from '../forms/schema-control.factory';
import { ContentPath } from '../models/content-path.enum';
import { EditorTab } from '../models/editor-tab.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { ACHIEVEMENTS_SECTIONS } from './achievements.sections';
import { tabSchema } from './editor-tabs';
import { SHOWS_PAGE_SECTION, TEAM_PAGE_SECTION, VIDEOS_PAGE_SECTION } from './inner-pages.sections';

const pages = fakeDb.pages as unknown as Record<string, Record<string, unknown>>;

/** @returns The page's document as stored today. */
function stored(path: ContentPath): Record<string, unknown> {
  return pages[path.replace('pages/', '')] ?? {};
}

const PAGE_SECTIONS: readonly IEditorSection[] = [
  VIDEOS_PAGE_SECTION,
  TEAM_PAGE_SECTION,
  SHOWS_PAGE_SECTION,
  ...ACHIEVEMENTS_SECTIONS,
];

/** The inner pages' own text, editable since 2.11.0 (0028). */
describe('inner page schemas', () => {
  it.each(PAGE_SECTIONS.map((section) => [section.id, section]))(
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
    ContentPath.PagesVideos,
    ContentPath.PagesTeam,
    ContentPath.PagesShows,
    ContentPath.PagesAchievements,
  ])('should leave no part of %s without a field', (path) => {
    const covered = new Set(
      PAGE_SECTIONS.filter((section) => section.path === path).flatMap((section) =>
        section.fields.map((field) => field.key),
      ),
    );

    expect(Object.keys(stored(path)).filter((key) => !covered.has(key))).toEqual([]);
  });

  it.each<readonly [string, IEditorSection, AppRoute]>([
    ['videos-page', VIDEOS_PAGE_SECTION, AppRoute.Videos],
    ['team-page', TEAM_PAGE_SECTION, AppRoute.Team],
    ['shows-page', SHOWS_PAGE_SECTION, AppRoute.Shows],
    ...ACHIEVEMENTS_SECTIONS.map(
      (section) => [section.id, section, AppRoute.Achievements] as const,
    ),
  ])('should preview %s on its own page', (_id, section, page) => {
    expect(section.page).toBe(page);
  });

  it.each([
    [EditorTab.Videos, 'videos-page'],
    [EditorTab.Team, 'team-page'],
    [EditorTab.Shows, 'shows-page'],
  ])('should put the page’s own card last on %s', (tab, id) => {
    expect(tabSchema(tab)?.sections.at(-1)?.id).toBe(id);
  });

  it('should give Achievements a card for each part of the page, top to bottom', () => {
    expect(tabSchema(EditorTab.Achievements)?.sections.map((section) => section.id)).toEqual([
      'achievements-heading',
      'achievements-milestones',
      'achievements-recognition',
      'achievements-press',
      'achievements-performances',
      'achievements-cta',
    ]);
  });
});
