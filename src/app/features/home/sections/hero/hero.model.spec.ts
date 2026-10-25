import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { SITE } from '@shared/testing/fixtures';
import { HERO_DTO } from '../../testing/home-fixtures';
import { HeroModel } from './hero.model';

describe('HeroModel', () => {
  const model = new HeroModel(HERO_DTO, SITE.contact);

  it('should copy the hero text', () => {
    expect(model.title).toBe('Find your rhythm.');
    expect(model.highlight).toBe('Share the beat.');
    expect(model.audiences).toEqual(['Corporate teams', 'Family functions', 'Friends & fun']);
  });

  it('should link the proposal and game calls to their home sections', () => {
    expect(model.proposal).toMatchObject({ route: AppRoute.Home, fragment: PageAnchor.Contact });
    expect(model.game).toMatchObject({ label: 'Play the rhythm game', fragment: PageAnchor.Play });
  });

  it('should build WhatsApp and call links from the contact details', () => {
    expect(model.whatsApp.href).toBe('https://wa.me/919284276168');
    expect(model.call).toMatchObject({ label: 'Call +91 92842 76168', href: 'tel:+919284276168' });
  });
});
