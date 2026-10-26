import { TestBed } from '@angular/core/testing';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { texts } from '@shared/testing/fixtures';
import { HOME, stubBackend } from '../../testing/home-fixtures';
import { HomePhilosophyComponent } from './home-philosophy.component';

describe('HomePhilosophyComponent', () => {
  function render(body: unknown): { element: HTMLElement; get: ReturnType<typeof vi.fn> } {
    const backend = stubBackend(body);
    TestBed.configureTestingModule({ providers: [backend.provider] });
    const fixture = TestBed.createComponent(HomePhilosophyComponent);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, get: backend.get };
  }

  it('should render the statement, pillars, goals and journey', () => {
    const { element, get } = render(HOME.philosophy);

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomePhilosophy);
    expect(element.querySelector('section')?.id).toBe('philosophy');
    expect(texts(element, '.pillar h3')).toEqual([
      'Everyone can play',
      'Listen to belong',
      'Joy is shared',
    ]);
    expect(texts(element, '.goal b')).toEqual(['01', '02', '03', '04']);
    expect(texts(element, '.jr b')).toEqual(['[YEAR]', '[YEAR]', '[YEAR]', 'Today']);
  });

  it('should render nothing until the section has loaded', () => {
    expect(render(null).element.querySelector('section')).toBeNull();
  });
});
