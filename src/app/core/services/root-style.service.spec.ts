import { TestBed } from '@angular/core/testing';
import { type IRootStyle } from '@core/interfaces/i-root-style';
import { APP_PREVIEW } from '@core/tokens/app-preview.token';
import { LocalStoreService } from './local-store.service';
import { REMEMBERED_BACKGROUND_KEY, RootStyleService } from './root-style.service';

const FONTS = 'https://fonts.googleapis.com/css2?family=Inter';
const FALLBACKS = 'fonts/fraunces-inter.css';

function style(change: Partial<IRootStyle> = {}): IRootStyle {
  return {
    variables: new Map(),
    stylesheets: [],
    browserColour: '#171210',
    rememberedBackground: null,
    ...change,
  };
}

describe('RootStyleService', () => {
  const root = document.documentElement.style;
  let store: { set: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> };

  function setUp(preview = false): RootStyleService {
    store = { set: vi.fn(), remove: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: LocalStoreService, useValue: store },
        { provide: APP_PREVIEW, useValue: preview },
      ],
    });
    return TestBed.inject(RootStyleService);
  }

  afterEach(() => {
    for (const name of Array.from(root).filter((property) => property.startsWith('--ty-'))) {
      root.removeProperty(name);
    }
    document.querySelectorAll('link[data-ty-theme]').forEach((link) => {
      link.remove();
    });
    document.querySelector('meta[name="theme-color"]')?.remove();
  });

  it('should set the variables on the page’s root when applied', () => {
    setUp().apply(style({ variables: new Map([['--ty-ink', '#000000']]) }));

    expect(root.getPropertyValue('--ty-ink')).toBe('#000000');
  });

  it('should clear a variable the next style doesn’t set, whoever set it', () => {
    root.setProperty('--ty-cream', '#ffffff');
    root.setProperty('--other', '1');

    setUp().apply(style());

    expect(root.getPropertyValue('--ty-cream')).toBe('');
    expect(root.getPropertyValue('--other')).toBe('1');
    root.removeProperty('--other');
  });

  it('should add each stylesheet once when the same style is applied twice', () => {
    const service = setUp();

    service.apply(style({ stylesheets: [FONTS, FALLBACKS] }));
    service.apply(style({ stylesheets: [FONTS, FALLBACKS] }));

    const hrefs = Array.from(document.querySelectorAll('link[data-ty-theme]')).map((link) =>
      link.getAttribute('href'),
    );
    expect(hrefs).toEqual([FONTS, FALLBACKS]);
  });

  it('should replace the stylesheets when the style changes', () => {
    const service = setUp();
    service.apply(style({ stylesheets: [FONTS, FALLBACKS] }));

    service.apply(style({ stylesheets: [`${FONTS}&v=2`] }));

    const hrefs = Array.from(document.querySelectorAll('link[data-ty-theme]')).map((link) =>
      link.getAttribute('href'),
    );
    expect(hrefs).toEqual([`${FONTS}&v=2`]);
  });

  it('should remove the stylesheets when the style has none', () => {
    const service = setUp();
    service.apply(style({ stylesheets: [FONTS] }));

    service.apply(style());

    expect(document.querySelector('link[data-ty-theme]')).toBeNull();
  });

  it('should colour the browser bar when the page has its meta tag', () => {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);

    setUp().apply(style({ browserColour: '#faf6f0' }));

    expect(meta.getAttribute('content')).toBe('#faf6f0');
  });

  it('should remember the background for the next visit when it isn’t today’s', () => {
    setUp().apply(style({ rememberedBackground: '#000000' }));

    expect(store.set).toHaveBeenCalledWith(REMEMBERED_BACKGROUND_KEY, '#000000');
  });

  it('should forget the background when it’s today’s', () => {
    setUp().apply(style());

    expect(store.remove).toHaveBeenCalledWith(REMEMBERED_BACKGROUND_KEY);
  });

  it('should remember nothing when the visit is a preview of a draft', () => {
    setUp(true).apply(style({ rememberedBackground: '#000000' }));

    expect(store.set).not.toHaveBeenCalled();
    expect(store.remove).not.toHaveBeenCalled();
  });
});
