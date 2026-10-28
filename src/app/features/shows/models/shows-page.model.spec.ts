import { IconName } from '@shared/enums/icon-name.enum';
import { PAGES, SHOW_FORMATS_FIXTURE, SITE } from '@shared/testing/fixtures';
import { ShowsPageModel } from './shows-page.model';

describe('ShowsPageModel', () => {
  const page = () => new ShowsPageModel(PAGES.shows, SHOW_FORMATS_FIXTURE, SITE);

  it('should turn each shared format into a card with its icon and labelled specs', () => {
    const [first] = page().formats;

    expect(page().formats).toHaveLength(SHOW_FORMATS_FIXTURE.length);
    expect(first?.icon).toBe(IconName.Mic);
    expect(first?.specs).toEqual([
      { label: 'Ensemble', value: '[6–8 players]' },
      { label: 'Set length', value: '[60–90 min]' },
      { label: 'Best for', value: 'Stage events, annual days' },
    ]);
  });

  it('should send WhatsApp to the business number from site config', () => {
    expect(page().whatsApp.href).toBe('https://wa.me/919284276168');
  });

  it('should link the process buttons to the proposal form and the Videos page', () => {
    expect(page().request.fragment).toBe('contact');
    expect(page().watch.route).toBe('/videos');
  });
});
