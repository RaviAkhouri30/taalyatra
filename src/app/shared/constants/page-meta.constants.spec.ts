import { SeoPage } from '@shared/enums/seo-page.enum';
import { PAGE_META } from './page-meta.constants';

describe('PAGE_META', () => {
  it.each(Object.values(SeoPage))('should give %s a title and a description', (page) => {
    expect(PAGE_META[page].title).toMatch(/Taal Yatra/);
    expect(PAGE_META[page].description.length).toBeGreaterThan(0);
  });

  it('should keep every default within the lengths the admin allows', () => {
    for (const { title, description } of Object.values(PAGE_META)) {
      expect(title.length).toBeLessThanOrEqual(70);
      expect(description.length).toBeLessThanOrEqual(200);
    }
  });
});
