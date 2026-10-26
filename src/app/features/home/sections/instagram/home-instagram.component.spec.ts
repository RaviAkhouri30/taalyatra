import { TestBed } from '@angular/core/testing';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { queryAll } from '@shared/testing/fixtures';
import { HOME, stubBackend } from '../../testing/home-fixtures';
import { HomeInstagramComponent } from './home-instagram.component';

describe('HomeInstagramComponent', () => {
  function render(body: unknown): { element: HTMLElement; get: ReturnType<typeof vi.fn> } {
    const backend = stubBackend(body);
    TestBed.configureTestingModule({ providers: [backend.provider] });
    const fixture = TestBed.createComponent(HomeInstagramComponent);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, get: backend.get };
  }

  it('should render the posts with captions and a follow link', () => {
    const { element, get } = render(HOME.instagram);
    const posts = queryAll(element, '.igc');

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeInstagram);
    expect(element.querySelector('section')?.id).toBe('insta');
    expect(posts).toHaveLength(6);
    expect(posts[0]?.getAttribute('aria-label')).toBe('Open this post on Instagram');
    expect(element.querySelector('.ighead a')?.textContent.trim()).toBe('Follow @taalyatra');
  });

  it('should render nothing until the section has loaded', () => {
    expect(render(null).element.querySelector('section')).toBeNull();
  });
});
