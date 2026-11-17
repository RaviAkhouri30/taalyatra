import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, NEVER, firstValueFrom } from 'rxjs';
import { APP_PREVIEW } from '@core/tokens/app-preview.token';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { provideVisibility } from '@shared/testing/fixtures';
import { HomePageViewModel } from './home-page.view-model';
import { SectionHoldService } from './section-hold.service';

describe('HomePageViewModel', () => {
  const fragment = new BehaviorSubject<string | null>(null);
  const hold = vi.fn(() => NEVER);

  beforeEach(() => {
    fragment.next(null);
    hold.mockClear();
  });

  function setUp(visibility?: SiteVisibility, preview = false) {
    TestBed.configureTestingModule({
      providers: [
        HomePageViewModel,
        provideVisibility(visibility),
        { provide: APP_PREVIEW, useValue: preview },
        { provide: ActivatedRoute, useValue: { fragment } },
        { provide: SectionHoldService, useValue: { hold } },
      ],
    });
    return TestBed.inject(HomePageViewModel);
  }

  it('should hold each linked section in place while the page fills in', () => {
    const subscription = setUp().init().subscribe();

    fragment.next('contact');
    fragment.next('faq');

    expect(hold.mock.calls).toEqual([['contact'], ['faq']]);
    subscription.unsubscribe();
  });

  it('should hold nothing when the address links to no section', () => {
    const subscription = setUp().init().subscribe();

    expect(hold).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });

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

  it("should skip the intro in the editor's preview", async () => {
    const model = setUp(undefined, true);

    await firstValueFrom(model.init(), { defaultValue: undefined });

    expect(model.shown().intro).toBe(false);
    expect(model.shown().gallery).toBe(true);
  });
});
