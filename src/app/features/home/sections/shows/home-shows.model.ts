import { AppRoute } from '@shared/enums/app-route.enum';
import { type INavLink } from '@shared/interfaces/i-site-link';
import { navLink } from '@shared/utils/link.util';
import { visibleLink } from '@shared/utils/visibility.util';
import { type IImage } from '@shared/interfaces/i-image';
import { type IShowFormatDto } from '@shared/interfaces/i-show-format';
import { ShowSpotlightModel } from '@shared/models/show-spotlight.model';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { type IHomeShowsDto } from './i-home-shows';

/** A show format card with its image; every card opens the Shows page. */
export class ShowTeaserModel {
  public readonly image: IImage;
  public readonly title: string;
  public readonly text: string;

  public constructor(dto: Pick<IShowFormatDto, 'image' | 'title' | 'text'>) {
    this.image = dto.image;
    this.title = dto.title;
    this.text = dto.text;
  }
}

/** Shows teaser ready for display: the classical spotlight, then the other formats. */
export class HomeShowsModel {
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly lead: string;
  /** Link to the Shows page, used by the header button and by every card. */
  public readonly showsPage: INavLink | null;
  /** The featured format (classical concerts), or `null` when none is featured. */
  public readonly spotlight: ShowSpotlightModel | null;
  public readonly formats: readonly ShowTeaserModel[];

  /**
   * @param dto The teaser heading.
   * @param formats The shared show formats.
   */
  public constructor(
    dto: IHomeShowsDto,
    formats: readonly IShowFormatDto[],
    visibility: SiteVisibility = SiteVisibility.allVisible,
  ) {
    this.eyebrow = dto.eyebrow;
    this.title = dto.title;
    this.lead = dto.lead;
    this.showsPage = visibleLink(navLink(dto.cta, AppRoute.Shows), visibility);
    this.spotlight = ShowSpotlightModel.from(formats);
    this.formats = ShowSpotlightModel.others(formats).map((format) => new ShowTeaserModel(format));
  }
}
