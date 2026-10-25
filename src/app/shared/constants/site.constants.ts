import { AppRoute } from '@shared/enums/app-route.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { SocialPlatform } from '@shared/enums/social-platform.enum';
import { type IPhoneNumber } from '@shared/interfaces/i-contact-details';
import { type ISiteConfig } from '@shared/interfaces/i-site-config';
import { toWhatsAppUrl } from '@shared/utils/contact-links.util';
import { navLink } from '@shared/utils/link.util';

/** Business phone, reused by contact details and the WhatsApp link. */
const PHONE: IPhoneNumber = { display: '+91 92842 76168', e164: '+919284276168' };

/** Copyright year printed in the footer (design: 2026). */
const COPYRIGHT_YEAR = 2026;

/**
 * Site content from the design prototype. Served by `SITE_CONFIG` until the admin
 * "Contact"/"Offers" tabs persist it to Firestore.
 * Social profile URLs are the prototype's placeholders — replace them with the real profiles.
 */
export const DEFAULT_SITE_CONFIG: ISiteConfig = {
  brand: {
    name: 'Taal Yatra',
    tagline: 'Drum Circle',
    logoUrl: '/images/brand/logo.jpg',
    logoAlt: 'Taal Yatra Drum Circle logo',
    description: 'Drum circles and music workshops for teams, families and fun-seekers.',
    domain: 'taalyatra.in',
  },
  contact: {
    phone: PHONE,
    email: 'contact@taalyatra.in',
    businessName: 'Taalyatra drum circle',
    localName: { text: 'ताल्यात्रा ड्रम सर्कल', lang: 'mr' },
    locality: 'Kharadi, Pune',
    address:
      'Parmar Square, B106, Kharadi South Main Road, above Habib Saloon, opp. City Pride Theatre, Rakshak Nagar, Kharadi, Pune, Maharashtra 411014',
    hours: 'Opens 9:00 am',
    plusCode: 'HW2Q+5J Pune',
    mapsUrl: 'https://maps.app.goo.gl/owD7w58Unr5GkEiN8',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=18.5503972,73.9390361',
  },
  socials: [
    {
      platform: SocialPlatform.WhatsApp,
      label: 'WhatsApp',
      href: toWhatsAppUrl(PHONE),
      icon: IconName.WhatsApp,
    },
    {
      platform: SocialPlatform.Instagram,
      label: 'Instagram',
      href: 'https://www.instagram.com/',
      icon: IconName.Instagram,
    },
    {
      platform: SocialPlatform.YouTube,
      label: 'YouTube',
      href: 'https://www.youtube.com/',
      icon: IconName.YouTube,
    },
    {
      platform: SocialPlatform.Facebook,
      label: 'Facebook',
      href: 'https://www.facebook.com/',
      icon: IconName.Facebook,
    },
  ],
  promotion: {
    link: navLink('Diwali offers', AppRoute.Home, { fragment: PageAnchor.Diwali }),
    subtitle: 'Light up your celebration',
    dismissLabel: 'Dismiss Diwali offer',
  },
  copyrightYear: COPYRIGHT_YEAR,
};
