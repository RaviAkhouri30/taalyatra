import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { FestiveTheme } from '@shared/enums/festive-theme.enum';
import { SITE, queryAll, texts } from '@shared/testing/fixtures';
import { OFFER_DTO, stubBackend } from '../../testing/home-fixtures';
import { HomeOfferComponent } from './home-offer.component';
import { OfferModel } from './offer.model';

describe('HomeOfferComponent', () => {
  function render(body: unknown): { element: HTMLElement; get: ReturnType<typeof vi.fn> } {
    const backend = stubBackend(body);
    TestBed.configureTestingModule({ providers: [provideRouter([]), backend.provider] });
    const fixture = TestBed.createComponent(HomeOfferComponent);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, get: backend.get };
  }

  it('should render the offer under the #diwali anchor with its festive effect', () => {
    const { element, get } = render(OFFER_DTO);

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeOffer);
    expect(element.querySelector('section')?.id).toBe('diwali');
    expect(element.querySelector('h2')?.textContent).toBe(OFFER_DTO.title);
    expect(element.querySelector('.fx.a-sparks')).not.toBeNull();
  });

  it('should render a card per package and both calls to action', () => {
    const { element } = render(OFFER_DTO);
    const buttons = queryAll(element, '.dbtns a');

    expect(texts(element, '.dcard h3')).toEqual(OFFER_DTO.cards.map((card) => card.title));
    expect(queryAll(element, '.dico svg')).toHaveLength(3);
    expect(buttons.map((button) => button.getAttribute('href'))).toEqual([
      '/#contact',
      'https://wa.me/919284276168',
    ]);
    expect(buttons[0]?.classList).toContain('btn--dark');
    expect(buttons[1]?.classList).toContain('btn--line');
  });

  it('should render nothing while no offer is available', () => {
    expect(render(null).element.querySelector('section')).toBeNull();
  });
});

describe('OfferModel', () => {
  it('should fall back to no effect for an unknown theme', () => {
    const model = new OfferModel({ ...OFFER_DTO, theme: 'fireworks' }, SITE.contact);

    expect(model.theme).toBe(FestiveTheme.None);
    expect(model.footnote).toBe(OFFER_DTO.footnote);
  });
});
