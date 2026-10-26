import { AppRoute } from '@shared/enums/app-route.enum';
import { type INavLink } from '@shared/interfaces/i-site-link';
import { type IVideoDto } from '@shared/interfaces/i-video';
import { formatTemplate } from '@shared/utils/format-template.util';
import { navLink } from '@shared/utils/link.util';
import { type IHomeVideosDto } from './i-home-videos';

/** A video card ready for display. */
export interface IVideoCard {
  readonly video: IVideoDto;
  readonly ariaLabel: string;
}

/** "Latest videos" teaser: heading, link to the library and the newest videos. */
export class HomeVideosModel {
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly videosPage: INavLink;
  public readonly cards: readonly IVideoCard[];

  public constructor(dto: IHomeVideosDto, videos: readonly IVideoDto[]) {
    this.eyebrow = dto.eyebrow;
    this.title = dto.title;
    this.videosPage = navLink(dto.cta, AppRoute.Videos);
    this.cards = videos.slice(0, dto.count).map((video) => ({
      video,
      ariaLabel: formatTemplate(dto.watchLabel, { title: video.title }),
    }));
  }
}
