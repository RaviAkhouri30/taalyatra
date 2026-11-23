import { SITE } from '@shared/testing/fixtures';
import { HOME } from '../../testing/home-fixtures';
import { OfferModel } from './offer.model';

describe('OfferModel', () => {
  it('should leave a hidden card out, keeping the rest in order (2.15.0)', () => {
    const cards = HOME.offer.cards.map((card, index) => ({ ...card, hidden: index === 1 }));

    const offer = new OfferModel({ ...HOME.offer, cards }, SITE.contact);

    expect(offer.cards.map((card) => card.title)).toEqual(
      HOME.offer.cards.filter((_card, index) => index !== 1).map((card) => card.title),
    );
  });
});
