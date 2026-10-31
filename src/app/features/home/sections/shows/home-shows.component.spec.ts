import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { provideVisibility, queryAll, texts } from '@shared/testing/fixtures';
import { SHOW_FORMATS, SHOWS_DTO, stubBackend } from '../../testing/home-fixtures';
import { HomeShowsComponent } from './home-shows.component';

describe('HomeShowsComponent', () => {
  function render(
    body: unknown,
    visibility?: SiteVisibility,
  ): { element: HTMLElement; get: ReturnType<typeof vi.fn> } {
    const backend = stubBackend(body);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), backend.provider, provideVisibility(visibility)],
    });
    const fixture = TestBed.createComponent(HomeShowsComponent);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, get: backend.get };
  }

  it('should render the header with a link to the Shows page', () => {
    const { element, get } = render(SHOWS_DTO);
    const button = element.querySelector('.ighead a');

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeShows);
    expect(element.querySelector('section')?.id).toBe('shows');
    expect(element.querySelector('h2')?.textContent).toBe('We play, not just facilitate.');
    expect(button?.textContent).toBe('See all formats');
    expect(button?.getAttribute('href')).toBe('/shows');
  });

  it('should lead with the classical spotlight', () => {
    const { element } = render(SHOWS_DTO);

    expect(element.querySelector('app-show-spotlight h3')?.textContent).toBe(
      'An evening of Hindustani classical rhythm.',
    );
  });

  it('should render the other formats as image cards, each opening the Shows page', () => {
    const { element } = render(SHOWS_DTO);
    const cards = queryAll(element, '.shc');

    expect(texts(element, '.shc b')).toEqual(SHOW_FORMATS.slice(1).map((format) => format.title));
    expect(cards.every((card) => card.getAttribute('href') === '/shows')).toBe(true);
    expect(queryAll(element, '.shc img')).toHaveLength(6);
  });

  it('should render nothing until the teaser has loaded', () => {
    expect(render(null).element.querySelector('section')).toBeNull();
  });

  it('should keep the format cards but drop every Shows page link when it is switched off', () => {
    const { element } = render(SHOWS_DTO, new SiteVisibility({ pages: { shows: false } }));
    const cards = queryAll(element, '.shc');

    expect(element.querySelector('.ighead a')).toBeNull();
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((card) => !card.hasAttribute('href'))).toBe(true);
  });
});
