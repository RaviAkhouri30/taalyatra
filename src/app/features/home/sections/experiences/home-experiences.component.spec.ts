import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { queryAll, texts } from '@shared/testing/fixtures';
import { EXPERIENCES_DTO, stubBackend } from '../../testing/home-fixtures';
import { type IExperiencesDto } from './i-experiences';
import { HomeExperiencesComponent } from './home-experiences.component';
import { HomeExperiencesViewModel } from './home-experiences.view-model';

describe('HomeExperiencesComponent', () => {
  function render(body: unknown) {
    const backend = stubBackend(body);
    TestBed.configureTestingModule({ providers: [provideRouter([]), backend.provider] });
    const fixture = TestBed.createComponent(HomeExperiencesComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const choose = (label: string): void => {
      queryAll(element, '.fc')
        .find((chip) => chip.textContent.trim() === label)
        ?.click();
      fixture.detectChanges();
    };
    return { element, choose, get: backend.get, fixture };
  }

  it('should show every experience under "All", signature card first', () => {
    const { element, get } = render(EXPERIENCES_DTO);

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeExperiences);
    expect(element.querySelector('section')?.id).toBe('experiences');
    expect(texts(element, '.card h3')).toEqual([
      'Drum Circle',
      'Boombastic',
      'Body Percussion',
      'Harmonica',
      'Trash Jam',
      'Lezim Workshop',
    ]);
    expect(element.querySelector('.card.feat .cta')?.textContent).toBe('See full details');
    expect(element.querySelector('.card.feat')?.getAttribute('href')).toBe('/#drum-circle-details');
  });

  it('should filter the cards by the chosen category', () => {
    const { element, choose } = render(EXPERIENCES_DTO);

    choose('Melody');
    expect(texts(element, '.card h3')).toEqual(['Boombastic', 'Harmonica']);

    choose('Percussion');
    expect(texts(element, '.card h3')).toEqual(['Drum Circle', 'Trash Jam']);
    expect(element.querySelector('.emptyish span')).toBeNull();
  });

  it('should explain when a category has nothing in it', () => {
    const dto: IExperiencesDto = {
      ...EXPERIENCES_DTO,
      categories: [...EXPERIENCES_DTO.categories, 'Quiet'],
    };
    const { element, choose } = render(dto);

    choose('Quiet');

    expect(queryAll(element, '.card')).toHaveLength(0);
    expect(element.querySelector('.emptyish span')?.textContent).toBe(EXPERIENCES_DTO.emptyMessage);
  });

  it('should render nothing until the section has loaded', () => {
    const { element, fixture } = render(null);
    const model = fixture.debugElement.injector.get(HomeExperiencesViewModel);

    expect(element.querySelector('section')).toBeNull();
    expect(model.category()).toBe('');
    expect(model.showFeatured()).toBe(false);
    expect(model.visibleItems()).toEqual([]);
  });
});
