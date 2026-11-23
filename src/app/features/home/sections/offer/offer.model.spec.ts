import { Festival } from '@shared/enums/festival.enum';
import { SITE } from '@shared/testing/fixtures';
import { HOME } from '../../testing/home-fixtures';
import { OfferModel } from './offer.model';

describe('OfferModel', () => {
  it('should take the festival chosen with the offer’s dates when there is one', () => {
    const offer = new OfferModel(HOME.offer, SITE.contact, Festival.Holi);

    expect(offer.festival).toBe(Festival.Holi);
  });

  it('should read the old sparks as Diwali when no festival is chosen yet', () => {
    expect(new OfferModel({ ...HOME.offer, theme: 'sparks' }, SITE.contact).festival).toBe(
      Festival.Diwali,
    );
  });

  it('should show no festival for an old offer without sparks', () => {
    expect(new OfferModel({ ...HOME.offer, theme: 'fireworks' }, SITE.contact).festival).toBe(
      Festival.None,
    );
  });

  it('should leave a hidden card out, keeping the rest in order (2.15.0)', () => {
    const cards = HOME.offer.cards.map((card, index) => ({ ...card, hidden: index === 1 }));

    const offer = new OfferModel({ ...HOME.offer, cards }, SITE.contact);

    expect(offer.cards.map((card) => card.title)).toEqual(
      HOME.offer.cards.filter((_card, index) => index !== 1).map((card) => card.title),
    );
  });
});
