import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { SiteConfigModel } from '@shared/models/site-config.model';
import { SITE_DTO, provideSiteConfig, queryAll, texts } from '@shared/testing/fixtures';
import { OFFER_DTO, stubBackend } from '../../testing/home-fixtures';
import { HomeOfferComponent } from './home-offer.component';

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
    expect(element.querySelector('app-festive-effects')).not.toBeNull();
    // Diwali keeps the theme's colours.
    expect(element.querySelector('section')?.classList).not.toContain('festival-look');
  });

  it('should take the colours of the festival chosen with the offer’s dates (2.16.0)', () => {
    const promotion = { ...SITE_DTO.promotion!, festival: 'holi' };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        stubBackend(OFFER_DTO).provider,
        provideSiteConfig(new SiteConfigModel({ ...SITE_DTO, promotion })),
      ],
    });
    const fixture = TestBed.createComponent(HomeOfferComponent);
    fixture.detectChanges();
    const section = (fixture.nativeElement as HTMLElement).querySelector('section');

    expect(section?.classList).toContain('festival-look');
    expect(section?.style.getPropertyValue('--fest-base')).toBe('#e4428f');
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
  it('should render nothing when no promotion is running', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        stubBackend(OFFER_DTO).provider,
        provideSiteConfig(new SiteConfigModel({ ...SITE_DTO, promotion: null })),
      ],
    });
    const fixture = TestBed.createComponent(HomeOfferComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('section')).toBeNull();
  });
});
