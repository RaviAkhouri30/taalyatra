import { TestBed } from '@angular/core/testing';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { queryAll } from '@shared/testing/fixtures';
import { HOME, stubBackend } from '../../testing/home-fixtures';
import { HomeCitiesComponent } from './home-cities.component';

describe('HomeCitiesComponent', () => {
  function render(body: unknown): { element: HTMLElement; get: ReturnType<typeof vi.fn> } {
    const backend = stubBackend(body);
    TestBed.configureTestingModule({ providers: [backend.provider] });
    const fixture = TestBed.createComponent(HomeCitiesComponent);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, get: backend.get };
  }

  it('should list the cities, highlighting the active ones', () => {
    const { element, get } = render(HOME.cities);
    const cities = queryAll(element, '.city');

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeCities);
    expect(cities).toHaveLength(6);
    expect(
      cities.filter((city) => city.classList.contains('on')).map((city) => city.textContent),
    ).toEqual(['Pune']);
  });

  it('should render nothing until the section has loaded', () => {
    expect(render(null).element.querySelector('section')).toBeNull();
  });
});
