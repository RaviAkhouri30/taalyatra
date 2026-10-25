import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PromoVariant } from '@shared/enums/variant.enums';
import { SITE, queryAll } from '@shared/testing/fixtures';
import { PromoBadgeComponent } from './promo-badge.component';
import { PromoBadgeViewModel } from './promo-badge.view-model';

describe('PromoBadgeComponent', () => {
  function render(variant: PromoVariant) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(PromoBadgeComponent);
    fixture.componentRef.setInput('promotion', SITE.promotion);
    fixture.componentRef.setInput('variant', variant);
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('should render the card style with title, subtitle and six sparks', () => {
    const { element } = render(PromoVariant.Card);

    expect(element.querySelector('app-promo-card .promo-t b')?.textContent).toBe('Diwali offers');
    expect(element.querySelector('small')?.textContent).toBe('Light up your celebration');
    expect(queryAll(element, '.spark')).toHaveLength(6);
    expect(element.querySelector('.promo-l')?.getAttribute('href')).toBe('/#diwali');
  });

  it('should render the pill style with bursts and fourteen sparks', () => {
    const { element } = render(PromoVariant.Pill);

    expect(element.querySelector('app-promo-pill b')?.textContent).toBe('Diwali offers');
    expect(queryAll(element, '.burst')).toHaveLength(2);
    expect(queryAll(element, '.cspark')).toHaveLength(14);
  });

  it.each([PromoVariant.Card, PromoVariant.Pill])(
    'should hide the %s badge once dismissed',
    (variant) => {
      const { fixture, element } = render(variant);
      const button = element.querySelector('button')!;

      expect(button.getAttribute('aria-label')).toBe('Dismiss Diwali offer');
      button.click();
      fixture.detectChanges();

      expect(element.querySelector('.promo')).toBeNull();
    },
  );
});

describe('PromoBadgeViewModel', () => {
  it('should start visible and remember a dismissal', () => {
    const model = new PromoBadgeViewModel();

    expect(model.dismissed()).toBe(false);
    model.dismiss();
    expect(model.dismissed()).toBe(true);
  });
});
