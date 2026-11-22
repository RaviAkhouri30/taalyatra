import { PAGE_META } from '@shared/constants/page-meta.constants';
import { SeoPage } from '@shared/enums/seo-page.enum';
import { buildFormGroup } from '../forms/schema-control.factory';
import { writeSection } from '../forms/schema-value';
import { type IGroupFieldSchema } from '../models/i-field-schema';
import { SEO_SECTION } from './seo.sections';

const pagesGroup = SEO_SECTION.fields[0] as IGroupFieldSchema;

/** Search and sharing (0028). */
describe('the Search and sharing schema', () => {
  it('should have a title and a description for each page', () => {
    expect(pagesGroup.fields.map((field) => field.key)).toEqual(Object.values(SeoPage));
  });

  it('should show each page’s default under its fields', () => {
    const team = pagesGroup.fields.find(
      (field) => field.key === (SeoPage.Team as string),
    ) as IGroupFieldSchema;

    expect(team.fields.map((field) => field.hint)).toEqual([
      `Leave empty to keep: ${PAGE_META[SeoPage.Team].title}`,
      `Leave empty to keep: ${PAGE_META[SeoPage.Team].description}`,
    ]);
  });

  it('should start empty, keeping the defaults, when nothing is stored', () => {
    const values = buildFormGroup(SEO_SECTION.fields, {}).getRawValue();

    expect(values['seo']).toMatchObject({ home: { title: '', description: '' } });
  });

  it('should store the titles under seo and leave the rest of the settings as they were', () => {
    const stored = { brand: { name: 'Taal Yatra' } };
    const form = buildFormGroup(SEO_SECTION.fields, stored);
    form.get(['seo', 'videos', 'title'])?.setValue('Our videos');

    const written = writeSection(SEO_SECTION, stored, form.getRawValue());

    expect(written['brand']).toEqual({ name: 'Taal Yatra' });
    expect(written['seo']).toMatchObject({ videos: { title: 'Our videos', description: '' } });
  });
});
