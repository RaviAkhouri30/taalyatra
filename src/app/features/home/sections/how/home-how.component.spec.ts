import { TestBed } from '@angular/core/testing';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { texts } from '@shared/testing/fixtures';
import { HOME, stubBackend } from '../../testing/home-fixtures';
import { HomeHowComponent } from './home-how.component';

describe('HomeHowComponent', () => {
  function render(body: unknown): { element: HTMLElement; get: ReturnType<typeof vi.fn> } {
    const backend = stubBackend(body);
    TestBed.configureTestingModule({ providers: [backend.provider] });
    const fixture = TestBed.createComponent(HomeHowComponent);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, get: backend.get };
  }

  it('should render the four steps under the #how anchor', () => {
    const { element, get } = render(HOME.how);

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeHow);
    expect(element.querySelector('section')?.id).toBe('how');
    expect(texts(element, '.step h3')).toEqual([
      'Tell us your plan',
      'We shape the session',
      'Play together',
      'Take the rhythm home',
    ]);
  });

  it('should render nothing until the section has loaded', () => {
    expect(render(null).element.querySelector('section')).toBeNull();
  });
});
