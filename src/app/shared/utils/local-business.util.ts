import { SocialPlatform } from '@shared/enums/social-platform.enum';
import { type ISiteConfig } from '@shared/interfaces/i-site-config';

/** Schema.org country code of the business address. */
const ADDRESS_COUNTRY = 'IN';

/** @returns Whether `href` points at a profile, not just a network's home page (placeholders). */
function isProfileUrl(href: string): boolean {
  try {
    const { pathname } = new URL(href);
    return pathname !== '/' && pathname !== '';
  } catch {
    return false;
  }
}

/**
 * Builds the Schema.org `LocalBusiness` description of Taal Yatra from site config, so search
 * engines get the same details the footer shows, stored once (0007, D6).
 * @param site Site configuration.
 * @param siteUrl Public address of the site, without a trailing slash.
 * @returns A JSON-LD object.
 */
export function toLocalBusiness(site: ISiteConfig, siteUrl: string): Record<string, unknown> {
  const { brand, contact } = site;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: brand.name,
    alternateName: contact.businessName,
    description: brand.description,
    url: `${siteUrl}/`,
    logo: `${siteUrl}${brand.logoUrl}`,
    telephone: contact.phone.e164,
    email: contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.address,
      addressLocality: contact.locality,
      addressCountry: ADDRESS_COUNTRY,
    },
    hasMap: contact.mapsUrl,
    sameAs: site.socials
      .filter((social) => social.platform !== SocialPlatform.WhatsApp && isProfileUrl(social.href))
      .map((social) => social.href),
  };
}
