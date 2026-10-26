import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type IImage } from '@shared/interfaces/i-image';
import { type ILightboxLabels } from '@shared/interfaces/i-lightbox-labels';
import { type IExternalLink, type INavLink } from '@shared/interfaces/i-site-link';
import { formatTemplate } from '@shared/utils/format-template.util';
import { externalLink, navLink } from '@shared/utils/link.util';
import { type IHomeGalleryDto } from './i-home-gallery';

/** A gallery tile: the photo and the accessible name of the button that opens it. */
export interface IGalleryTile {
  readonly photo: IImage;
  readonly openLabel: string;
}

/** Gallery section ready for display. */
export class HomeGalleryModel {
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly booking: INavLink;
  public readonly photos: readonly IImage[];
  public readonly tiles: readonly IGalleryTile[];
  public readonly more: IExternalLink;
  public readonly note: string;
  public readonly viewer: ILightboxLabels;

  public constructor(dto: IHomeGalleryDto, photos: readonly IImage[]) {
    this.eyebrow = dto.eyebrow;
    this.title = dto.title;
    this.booking = navLink(dto.cta, AppRoute.Home, { fragment: PageAnchor.Contact });
    this.photos = photos;
    this.tiles = photos.map((photo) => ({
      photo,
      openLabel: formatTemplate(dto.openLabel, { alt: photo.alt }),
    }));
    this.more = externalLink(dto.moreLabel, dto.moreUrl);
    this.note = dto.note;
    this.viewer = dto.viewer;
  }
}
