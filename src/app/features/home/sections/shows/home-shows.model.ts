import { AppRoute } from '@shared/enums/app-route.enum';
import { type IconName } from '@shared/enums/icon-name.enum';
import { type INavLink } from '@shared/interfaces/i-site-link';
import { toIconName } from '@shared/utils/icon-name.util';
import { navLink } from '@shared/utils/link.util';
import { type IShowFormatDto } from '@shared/interfaces/i-show-format';
import { type IHomeShowsDto } from './i-home-shows';

/** A show format card with a valid icon; every card opens the Shows page. */
export class ShowTeaserModel {
  public readonly icon: IconName;
  public readonly title: string;
  public readonly text: string;

  public constructor(dto: Pick<IShowFormatDto, 'icon' | 'title' | 'text'>) {
    this.icon = toIconName(dto.icon);
    this.title = dto.title;
    this.text = dto.text;
  }
}

/** Shows teaser ready for display. */
export class HomeShowsModel {
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly lead: string;
  /** Link to the Shows page, used by the header button and by every card. */
  public readonly showsPage: INavLink;
  public readonly formats: readonly ShowTeaserModel[];

  /**
   * @param dto The teaser heading.
   * @param formats The shared show formats (only icon, title and text are shown here).
   */
  public constructor(dto: IHomeShowsDto, formats: readonly IShowFormatDto[]) {
    this.eyebrow = dto.eyebrow;
    this.title = dto.title;
    this.lead = dto.lead;
    this.showsPage = navLink(dto.cta, AppRoute.Shows);
    this.formats = formats.map((format) => new ShowTeaserModel(format));
  }
}
