import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { queryAll, texts } from '@shared/testing/fixtures';
import { HOME, stubBackend } from '../../testing/home-fixtures';
import { HomeProofComponent } from './home-proof.component';

describe('HomeProofComponent', () => {
  function render(body: unknown): { element: HTMLElement; get: ReturnType<typeof vi.fn> } {
    const backend = stubBackend(body);
    TestBed.configureTestingModule({ providers: [provideRouter([]), backend.provider] });
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
});
