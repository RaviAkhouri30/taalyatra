import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { queryAll, texts } from '@shared/testing/fixtures';
import { HERO_DTO, stubBackend } from '../../testing/home-fixtures';
import { HomeHeroComponent } from './home-hero.component';

describe('HomeHeroComponent', () => {
  function render(body: unknown) {
    const { provider, get } = stubBackend(body);
    TestBed.configureTestingModule({ providers: [provideRouter([]), provider] });
    const fixture = TestBed.createComponent(HomeHeroComponent);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, get };
  }

  it('should load the hero copy and render the headline with its highlight', () => {
    const { element, get } = render(HERO_DTO);

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeHero);
    expect(element.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim()).toBe(
      'Find your rhythm. Share the beat.',
    );
    expect(element.querySelector('h1 .hl')?.textContent).toBe('Share the beat.');
    expect(element.querySelector('.lead')?.textContent).toContain('No experience needed.');
  });

  it('should render the three calls to action with contact links', () => {
    const { element } = render(HERO_DTO);
    const buttons = queryAll(element, '.hbtns a');

    expect(buttons.map((button) => button.getAttribute('href'))).toEqual([
      '/#contact',
      'https://wa.me/919284276168',
      'tel:+919284276168',
    ]);
    expect(buttons[1]?.classList).toContain('btn--ghost');
  });

  it('should render audience pills and the game link', () => {
    const { element } = render(HERO_DTO);

    expect(texts(element, '.pills span')).toEqual(HERO_DTO.audiences);
    expect(element.querySelector('a.pill--cta')?.getAttribute('href')).toBe('/#play');
  });

  it('should show the illustrations before the copy has loaded', () => {
    const { element } = render(null);

    expect(element.querySelector('h1')).toBeNull();
    expect(element.querySelector('img.stage')?.getAttribute('alt')).toContain('two hands playing');
    expect(element.querySelector('img.sky')?.getAttribute('alt')).toBe('');
  });
});
