import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { SITE } from '@shared/testing/fixtures';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  function create() {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_ENVIRONMENT, useValue: { ...environment, siteUrl: 'https://taalyatra.in' } },
      ],
    });
    return {
      seo: TestBed.inject(SeoService),
      meta: TestBed.inject(Meta),
      document: TestBed.inject(DOCUMENT),
    };
  }

  afterEach(() => {
    const document = TestBed.inject(DOCUMENT);
    document.head
      .querySelectorAll('link[rel="canonical"], #taal-yatra-business')
      .forEach((node) => {
        node.remove();
      });
  });

  it('should write the description, canonical URL and social tags for the page', () => {
    const { seo, meta, document } = create();

    seo.describe({ path: '/videos', title: 'Videos — Taal Yatra', description: 'Watch us.' }, SITE);

    expect(meta.getTag('name="description"')?.content).toBe('Watch us.');
    expect(meta.getTag('property="og:title"')?.content).toBe('Videos — Taal Yatra');
    expect(meta.getTag('property="og:url"')?.content).toBe('https://taalyatra.in/videos');
    expect(meta.getTag('name="twitter:description"')?.content).toBe('Watch us.');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://taalyatra.in/videos',
    );
  });

  it('should fall back to the brand when the route has no title or description', () => {
    const { seo, meta } = create();

    seo.describe({ path: '/', title: '', description: '' }, SITE);

    expect(meta.getTag('property="og:title"')?.content).toBe('Taal Yatra');
    expect(meta.getTag('name="description"')?.content).toBe(SITE.brand.description);
  });

  it('should keep one structured-data block and one canonical link across navigations', () => {
    const { seo, document } = create();

    seo.describe({ path: '/', title: 'Home', description: 'Home.' }, SITE);
    seo.describe({ path: '/team', title: 'Team', description: 'Team.' }, SITE);

    const blocks = document.head.querySelectorAll('script[type="application/ld+json"]');
    expect(blocks).toHaveLength(1);
    expect(JSON.parse(blocks[0]?.textContent ?? '{}')).toMatchObject({ '@type': 'LocalBusiness' });
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });
});
