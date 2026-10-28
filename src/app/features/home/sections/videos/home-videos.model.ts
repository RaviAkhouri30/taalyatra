import { AppRoute } from '@shared/enums/app-route.enum';
import { type INavLink } from '@shared/interfaces/i-site-link';
import { type IVideoCard, type IVideoDto } from '@shared/interfaces/i-video';
import { navLink } from '@shared/utils/link.util';
import { toVideoCards } from '@shared/utils/video-cards.util';
import { type IHomeVideosDto } from './i-home-videos';

/** "Latest videos" teaser: heading, link to the library and the newest videos. */
export class HomeVideosModel {
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly videosPage: INavLink;
  public readonly cards: readonly IVideoCard[];

  /**
   * @param dto The teaser heading.
   * @param videos The shared video library.
   * @param watchLabel Accessible name of each card, with `{title}` (`site/config.labels`).
   */
  public constructor(dto: IHomeVideosDto, videos: readonly IVideoDto[], watchLabel: string) {
    this.eyebrow = dto.eyebrow;
    this.title = dto.title;
    this.videosPage = navLink(dto.cta, AppRoute.Videos);
    this.cards = toVideoCards(videos.slice(0, dto.count), watchLabel);
  }
}
