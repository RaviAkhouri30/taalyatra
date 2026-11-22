import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { PAGE_META } from '@shared/constants/page-meta.constants';
import { SeoPage } from '@shared/enums/seo-page.enum';
import { SiteConfigModel } from '@shared/models/site-config.model';
import { SITE, SITE_DTO } from '@shared/testing/fixtures';
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
      title: TestBed.inject(Title),
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
  it('should use a public page’s default title and description when none are stored', () => {
    const { seo, meta, title } = create();

    seo.describe({ path: '/shows', title: '', description: '', page: SeoPage.Shows }, SITE);

    expect(title.getTitle()).toBe(PAGE_META[SeoPage.Shows].title);
    expect(meta.getTag('name="description"')?.content).toBe(PAGE_META[SeoPage.Shows].description);
  });

  it('should set the browser tab’s title to the route’s when the route names no page', () => {
    const { seo, title } = create();

    seo.describe({ path: '/admin', title: 'Admin — Taal Yatra', description: '' }, SITE);

    expect(title.getTitle()).toBe('Admin — Taal Yatra');
  });

  it('should use the owner’s stored title and description when the page has them', () => {
    const { seo, meta, title } = create();
    const site = new SiteConfigModel({
      ...SITE_DTO,
      seo: { team: { title: 'Meet the drummers', description: 'Who plays with you.' } },
    });

    seo.describe(
      { path: '/team', title: 'Default', description: 'Default.', page: SeoPage.Team },
      site,
    );

    expect(title.getTitle()).toBe('Meet the drummers');
    expect(meta.getTag('name="description"')?.content).toBe('Who plays with you.');
    expect(meta.getTag('property="og:title"')?.content).toBe('Meet the drummers');
  });

  it('should keep the default for a stored value that is empty', () => {
    const { seo, meta, title } = create();
    const site = new SiteConfigModel({
      ...SITE_DTO,
      seo: { videos: { title: '', description: 'Our videos.' } },
    });

    seo.describe(
      { path: '/videos', title: 'Videos', description: 'Default.', page: SeoPage.Videos },
      site,
    );

    expect(title.getTitle()).toBe(PAGE_META[SeoPage.Videos].title);
    expect(meta.getTag('name="twitter:description"')?.content).toBe('Our videos.');
  });
});
