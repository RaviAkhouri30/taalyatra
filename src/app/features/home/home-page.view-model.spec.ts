import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { provideVisibility } from '@shared/testing/fixtures';
import { HomePageViewModel } from './home-page.view-model';

describe('HomePageViewModel', () => {
  function setUp(visibility?: SiteVisibility) {
    TestBed.configureTestingModule({
      providers: [HomePageViewModel, provideVisibility(visibility)],
    });
    return TestBed.inject(HomePageViewModel);
  }

  it('should render no optional section before the switches arrive', () => {
    const model = setUp();

    expect(model.shown().gallery).toBe(false);
    expect(model.shown().intro).toBe(false);
  });

  it('should render every section and widget when nothing is switched off', async () => {
    const model = setUp();

    await firstValueFrom(model.init(), { defaultValue: undefined });

    expect(Object.values(model.shown()).every(Boolean)).toBe(true);
  });

  it('should leave out exactly what is switched off', async () => {
    const model = setUp(
      new SiteVisibility({ sections: { gallery: false }, widgets: { assistant: false } }),
    );

    await firstValueFrom(model.init(), { defaultValue: undefined });

    expect(model.shown().gallery).toBe(false);
    expect(model.shown().assistant).toBe(false);
    expect(model.shown().faq).toBe(true);
    expect(model.shown().intro).toBe(true);
  });
});
