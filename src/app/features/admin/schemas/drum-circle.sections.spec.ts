import fakeDb from '@core/backends/fake/fake-db.json';
import { DRUM_CIRCLE_ITEMS } from '@shared/constants/content-limits.constants';
import { buildFormGroup } from '../forms/schema-control.factory';
import { sectionContent } from '../forms/schema-value';
import { ContentPath } from '../models/content-path.enum';
import { EditorTab } from '../models/editor-tab.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type IListFieldSchema } from '../models/i-field-schema';
import { PublishReport } from '../models/publish-report.model';
import { DRUM_CIRCLE_SECTIONS } from './drum-circle.sections';
import { ALL_SECTIONS, tabSchema } from './editor-tabs';

describe('DRUM_CIRCLE_SECTIONS', () => {
  const stored = fakeDb.home.drumCircle;
  const lists = DRUM_CIRCLE_SECTIONS.flatMap((section) => section.fields).filter(
    (field): field is IListFieldSchema => field.kind === FieldKind.List,
  );
  const list = (key: string) => lists.find((field) => field.key === key);

  it('should edit every key of the stored section, each in exactly one card', () => {
    const keys = DRUM_CIRCLE_SECTIONS.flatMap((section) =>
      section.fields.map((field) => field.key),
    );

    expect([...keys].sort((a, b) => a.localeCompare(b))).toEqual(
      Object.keys(stored).sort((a, b) => a.localeCompare(b)),
    );
  });

  it('should all edit home/drumCircle, on the Music & creativity tab', () => {
    const tab = tabSchema(EditorTab.Experiences);

    expect(
      DRUM_CIRCLE_SECTIONS.every((section) => section.path === ContentPath.HomeDrumCircle),
    ).toBe(true);
    expect(DRUM_CIRCLE_SECTIONS.every((section) => tab?.sections.includes(section))).toBe(true);
  });

  it('should keep exactly four facts and three pictures, which the layout has columns for', () => {
    expect([list('specs')?.minItems, list('specs')?.maxItems]).toEqual([4, 4]);
    expect([list('gallery')?.minItems, list('gallery')?.maxItems]).toEqual([
      DRUM_CIRCLE_ITEMS.pictures,
      DRUM_CIRCLE_ITEMS.pictures,
    ]);
    expect(list('gallery')?.item.kind).toBe(FieldKind.Image);
  });

  it('should hold the stored content in valid forms', () => {
    for (const section of DRUM_CIRCLE_SECTIONS) {
      const form = buildFormGroup(section.fields, sectionContent(section, stored));

      expect(form.valid).toBe(true);
    }
  });

  it('should find nothing to block in the stored section', () => {
    const report = PublishReport.check(
      new Map([
        [
          ContentPath.HomeDrumCircle,
          { path: ContentPath.HomeDrumCircle, content: stored, savedAt: 'x' },
        ],
      ]),
      ALL_SECTIONS,
      new Date('2026-11-17T00:00:00Z'),
    );

    expect(report.errors).toEqual([]);
  });

  it('should block publishing a picture with no description', () => {
    const [first, ...rest] = stored.gallery;
    const report = PublishReport.check(
      new Map([
        [
          ContentPath.HomeDrumCircle,
          {
            path: ContentPath.HomeDrumCircle,
            content: { ...stored, gallery: [{ ...first, alt: '' }, ...rest] },
            savedAt: 'x',
          },
        ],
      ]),
      ALL_SECTIONS,
      new Date('2026-11-17T00:00:00Z'),
    );

    expect(report.errors).not.toEqual([]);
  });
});
