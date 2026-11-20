import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideEditorTesting } from '../../testing/editor-testing';
import { TourService } from '../../services/tour.service';
import { TourOfferComponent } from './tour-offer.component';

describe('TourOfferComponent', () => {
  function render() {
    TestBed.configureTestingModule({
      providers: [...provideEditorTesting().providers, TourService],
    });
    // The tour opens its steps' pages; these specs have no admin routes.
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(TourOfferComponent);
    fixture.detectChanges();
    return {
      fixture,
      element: fixture.nativeElement as HTMLElement,
      tour: TestBed.inject(TourService),
    };
  }

  it('should offer the tour and start it', () => {
    const { fixture, element, tour } = render();
    expect(element.querySelector('h2')?.textContent).toBe('Take a one-minute tour?');

    element.querySelector<HTMLButtonElement>('button')!.click();
    fixture.detectChanges();

    expect(tour.step()?.id).toBe('welcome');
    expect(element.querySelector('section')).toBeNull();
  });

  it('should go away for Not now', () => {
    const { fixture, element } = render();

    element.querySelectorAll<HTMLButtonElement>('button')[1]!.click();
    fixture.detectChanges();

    expect(element.querySelector('section')).toBeNull();
  });
});
