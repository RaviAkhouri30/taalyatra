import { AppRoute } from '@shared/enums/app-route.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { SocialPlatform } from '@shared/enums/social-platform.enum';
import { SITE_DTO } from '@shared/testing/fixtures';
import { SiteConfigModel } from './site-config.model';

describe('SiteConfigModel', () => {
  it('should keep the brand, contact details and copyright year as stored', () => {
    const site = new SiteConfigModel(SITE_DTO);

    expect(site.brand).toBe(SITE_DTO.brand);
    expect(site.contact).toBe(SITE_DTO.contact);
    expect(site.copyrightYear).toBe(2026);
  });

  it('should put WhatsApp first, derived from the phone number', () => {
    const site = new SiteConfigModel({
      ...SITE_DTO,
      contact: {
        ...SITE_DTO.contact,
        phone: { display: '+91 90000 00000', e164: '+919000000000' },
      },
    });

    expect(site.socials[0]).toEqual({
      platform: SocialPlatform.WhatsApp,
      label: 'WhatsApp',
      href: 'https://wa.me/919000000000',
      icon: IconName.WhatsApp,
    });
  });

  it('should add each stored profile with its icon, in stored order', () => {
    const site = new SiteConfigModel(SITE_DTO);

    expect(site.socials.map((social) => [social.platform, social.icon])).toEqual([
      [SocialPlatform.WhatsApp, IconName.WhatsApp],
      [SocialPlatform.Instagram, IconName.Instagram],
      [SocialPlatform.YouTube, IconName.YouTube],
      [SocialPlatform.Facebook, IconName.Facebook],
    ]);
  });

  it('should skip a stored profile when its platform is unknown or WhatsApp', () => {
    const site = new SiteConfigModel({
      ...SITE_DTO,
      socials: [
        { platform: 'myspace', label: 'MySpace', href: 'https://myspace.com/' },
        { platform: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/1' },
      ],
    });

    expect(site.socials.map((social) => social.platform)).toEqual([SocialPlatform.WhatsApp]);
  });

  it('should link the promotion to the home page offer section', () => {
    const site = new SiteConfigModel(SITE_DTO);

    expect(site.promotion?.link).toMatchObject({
      label: 'Diwali offers',
      route: AppRoute.Home,
      fragment: PageAnchor.Diwali,
    });
    expect(site.promotion?.subtitle).toBe('Light up your celebration');
  });

  it('should have no promotion when none is stored', () => {
    expect(new SiteConfigModel({ ...SITE_DTO, promotion: null }).promotion).toBeNull();
  });
});
