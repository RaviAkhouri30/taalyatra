import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { queryAll, texts } from '@shared/testing/fixtures';
import { DRUM_CIRCLE_DTO, stubBackend } from '../../testing/home-fixtures';
import { DrumCircleModel } from './drum-circle.model';
import { HomeDrumCircleComponent } from './home-drum-circle.component';

describe('HomeDrumCircleComponent', () => {
  function render(body: unknown): { element: HTMLElement; get: ReturnType<typeof vi.fn> } {
    const backend = stubBackend(body);
    TestBed.configureTestingModule({ providers: [provideRouter([]), backend.provider] });
    const fixture = TestBed.createComponent(HomeDrumCircleComponent);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, get: backend.get };
  }

  it('should render the title and spec strip under its anchor', () => {
    const { element, get } = render(DRUM_CIRCLE_DTO);

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeDrumCircle);
    expect(element.querySelector('section')?.id).toBe('drum-circle-details');
    expect(element.querySelector('h2')?.textContent).toBe('Drum Circle');
    expect(texts(element, '.spec b')).toEqual([
      'Duration',
      'Location',
      'Group size',
      'Physical intensity',
    ]);
  });

  it('should render the about copy, chips and the proposal link', () => {
    const { element } = render(DRUM_CIRCLE_DTO);

    expect(queryAll(element, '.body')).toHaveLength(2);
    expect(texts(element, '.chips--objectives .chip')).toEqual(DRUM_CIRCLE_DTO.objectives);
    expect(texts(element, '.chips--occasions .chip')).toEqual(DRUM_CIRCLE_DTO.occasions);
    expect(element.querySelector('.two .btn')?.getAttribute('href')).toBe('/#contact');
  });

  it('should render the photos and the similar-experience links', () => {
    const { element } = render(DRUM_CIRCLE_DTO);

    expect(queryAll(element, '.gal img').map((image) => image.getAttribute('alt'))).toEqual([
      'Drum circle seen from above',
      'Hands on a drum',
      'Djembe close-up',
    ]);
    expect(
      queryAll(element, '.rel a').every((link) => link.getAttribute('href') === '/#experiences'),
    ).toBe(true);
  });

  it('should draw the flow with widths by minutes and alternate highlights', () => {
    const { element } = render(DRUM_CIRCLE_DTO);
    const segments = queryAll(element, 'app-flow-segment');

    expect(texts(element, '.seg span')).toEqual(['5 min', '10 min', '20 min', '15 min', '10 min']);
    expect(segments.map((segment) => segment.style.flexGrow)).toEqual([
      '5',
      '10',
      '20',
      '15',
      '10',
    ]);
    expect(segments.map((segment) => segment.classList.contains('o'))).toEqual([
      false,
      true,
      false,
      true,
      false,
    ]);
  });

  it('should render nothing until the details have loaded', () => {
    expect(render(null).element.querySelector('section')).toBeNull();
  });
});

describe('DrumCircleModel', () => {
  it('should label each flow step with its unit', () => {
    const model = new DrumCircleModel({ ...DRUM_CIRCLE_DTO, flowUnit: 'mins' });

    expect(model.flow[0]).toEqual({ title: 'Welcome', minutes: 5, duration: '5 mins' });
  });
});
