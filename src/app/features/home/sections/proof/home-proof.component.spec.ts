import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { provideVisibility, queryAll, texts } from '@shared/testing/fixtures';
import { HOME, stubBackend } from '../../testing/home-fixtures';
import { HomeProofComponent } from './home-proof.component';

describe('HomeProofComponent', () => {
  function render(
    body: unknown,
    visibility?: SiteVisibility,
  ): { element: HTMLElement; get: ReturnType<typeof vi.fn> } {
    const backend = stubBackend(body);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), backend.provider, provideVisibility(visibility)],
    });
    const fixture = TestBed.createComponent(HomeProofComponent);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, get: backend.get };
  }

  it('should render the numbers, testimonials and client tiles', () => {
    const { element, get } = render(HOME.proof);

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeProof);
    expect(element.querySelector('section')?.id).toBe('proof');
    expect(texts(element, '.stats span')).toEqual([
      'Sessions delivered',
      'People in the circle',
      'Cities played in',
      'Average rating',
    ]);
    expect(queryAll(element, 'blockquote')).toHaveLength(3);
    expect(texts(element, '.qav')).toEqual(['A', 'B', 'C']);
    expect(queryAll(element, '.client')).toHaveLength(10);
    expect(element.querySelector('.ighead a')?.getAttribute('href')).toBe('/achievements');
  });

  it('should render nothing until the section has loaded', () => {
    expect(render(null).element.querySelector('section')).toBeNull();
  });

  it('should link to the Achievements page while it is on', () => {
    const { element } = render(HOME.proof);

    expect(element.querySelector('.ighead a')?.getAttribute('href')).toBe('/achievements');
  });

  it('should leave out the Achievements link when that page is switched off', () => {
    const { element } = render(HOME.proof, new SiteVisibility({ pages: { achievements: false } }));

    expect(element.querySelector('.ighead a')).toBeNull();
  });
});
