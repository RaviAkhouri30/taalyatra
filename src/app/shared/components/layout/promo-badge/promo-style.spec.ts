import { type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PromoCardComponent } from '@shared/components/layout/promo-card/promo-card.component';
import { PromoPillComponent } from '@shared/components/layout/promo-pill/promo-pill.component';
import { Festival } from '@shared/enums/festival.enum';
import { SITE, queryAll } from '@shared/testing/fixtures';
import { type PromoStyle } from './promo-style';

describe('PromoStyle (the badge’s festival look, 2.16.0)', () => {
  function render(style: Type<PromoStyle>, festival: Festival | null): HTMLElement {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(style);
    fixture.componentRef.setInput('promotion', { ...SITE.promotion, festival });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should keep Diwali’s own sparks while no festival is chosen yet', () => {
    const element = render(PromoPillComponent, null);

    expect(queryAll(element, '.cspark')).toHaveLength(14);
    expect(element.querySelector('app-festive-effects')).toBeNull();
    expect(element.querySelector('app-diya-icon')).not.toBeNull();
  });

  it('should draw another festival’s effect around the pill, in its colours', () => {
    const element = render(PromoPillComponent, Festival.Holi);

    expect(queryAll(element, '.cspark')).toHaveLength(0);
    expect(queryAll(element, '.burst')).toHaveLength(2);
    expect(element.querySelector('app-festive-effects')).not.toBeNull();
    expect(element.querySelector('.promo')?.classList).toContain('festival-look');
  });

  it('should leave the pill still for no festival', () => {
    const element = render(PromoPillComponent, Festival.None);

    expect(queryAll(element, '.burst')).toHaveLength(0);
    expect(element.querySelector('app-festive-effects')).toBeNull();
  });

  it('should draw another festival’s effect around the card instead of its sparks', () => {
    const element = render(PromoCardComponent, Festival.Christmas);

    expect(queryAll(element, '.spark')).toHaveLength(0);
    expect(element.querySelector('app-festive-effects')).not.toBeNull();
  });

  it('should leave the card still, without its ring, for no festival', () => {
    const element = render(PromoCardComponent, Festival.None);

    expect(element.querySelector('.promo')?.classList).toContain('promo--still');
    expect(element.querySelector('app-festive-effects')).toBeNull();
  });
});
