import { SiteConfigModel } from '@shared/models/site-config.model';
import { SITE, SITE_DTO } from '@shared/testing/fixtures';
import { toLocalBusiness } from './local-business.util';

describe('toLocalBusiness', () => {
  it('should describe the business from site config', () => {
    const data = toLocalBusiness(SITE, 'https://taalyatra.in');

    expect(data).toMatchObject({
      '@type': 'LocalBusiness',
      name: 'Taal Yatra',
      url: 'https://taalyatra.in/',
      logo: 'https://taalyatra.in/images/brand/logo.jpg',
      telephone: '+919284276168',
      email: 'contact@taalyatra.in',
      address: { addressLocality: 'Kharadi, Pune', addressCountry: 'IN' },
    });
  });

  it('should list only real social profiles, not WhatsApp or placeholder home pages', () => {
    const site = new SiteConfigModel({
      ...SITE_DTO,
      socials: [
        { platform: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/' },
        { platform: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@taalyatra' },
        { platform: 'facebook', label: 'Facebook', href: 'not a url' },
      ],
    });

    expect(toLocalBusiness(site, 'https://taalyatra.in')['sameAs']).toEqual([
      'https://www.youtube.com/@taalyatra',
    ]);
  });
});
