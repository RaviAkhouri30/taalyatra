import { AppRoute } from '@shared/enums/app-route.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { LinkKind } from '@shared/enums/link-kind.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { externalLink, navLink } from './link.util';

describe('link utils', () => {
  it('should build an internal link with only the given options', () => {
    expect(navLink('Shows', AppRoute.Shows)).toEqual({
      kind: LinkKind.Internal,
      label: 'Shows',
      route: AppRoute.Shows,
    });
  });

  it('should include a fragment and icon when provided', () => {
    const link = navLink('Contact', AppRoute.Home, {
      fragment: PageAnchor.Contact,
      icon: IconName.Home,
    });

    expect(link.fragment).toBe(PageAnchor.Contact);
    expect(link.icon).toBe(IconName.Home);
  });

  it('should build an external link with an accessible name', () => {
    expect(externalLink('Maps', 'https://maps.example', { ariaLabel: 'Open maps' })).toEqual({
      kind: LinkKind.External,
      label: 'Maps',
      href: 'https://maps.example',
      ariaLabel: 'Open maps',
    });
  });

  it('should build an external link without options', () => {
    expect(externalLink('Mail', 'mailto:a@b.c').kind).toBe(LinkKind.External);
  });
});
