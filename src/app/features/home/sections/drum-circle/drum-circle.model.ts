import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type IImage } from '@shared/interfaces/i-image';
import { type INavLink } from '@shared/interfaces/i-site-link';
import { navLink } from '@shared/utils/link.util';
import { type IDrumCircleDto, type ISpecDto } from './i-drum-circle';

/** One session-flow step ready for display. */
export interface IFlowStep {
  readonly title: string;
  readonly minutes: number;
  /** Duration label, e.g. "20 min". */
  readonly duration: string;
}

/** Drum Circle details ready for display: links built, flow durations labelled. */
export class DrumCircleModel {
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly specs: readonly ISpecDto[];
  public readonly aboutTitle: string;
  public readonly about: readonly string[];
  public readonly objectivesTitle: string;
  public readonly objectives: readonly string[];
  public readonly occasionsTitle: string;
  public readonly occasions: readonly string[];
  public readonly proposal: INavLink;
  public readonly gallery: readonly IImage[];
  public readonly relatedTitle: string;
  public readonly related: readonly INavLink[];
  public readonly flowTitle: string;
  public readonly flow: readonly IFlowStep[];

  public constructor(dto: IDrumCircleDto) {
    this.eyebrow = dto.eyebrow;
    this.title = dto.title;
    this.specs = dto.specs;
    this.aboutTitle = dto.aboutTitle;
    this.about = dto.about;
    this.objectivesTitle = dto.objectivesTitle;
    this.objectives = dto.objectives;
    this.occasionsTitle = dto.occasionsTitle;
    this.occasions = dto.occasions;
    this.proposal = navLink(dto.cta, AppRoute.Home, { fragment: PageAnchor.Contact });
    this.gallery = dto.gallery;
    this.relatedTitle = dto.relatedTitle;
    this.related = dto.related.map((name) =>
      navLink(name, AppRoute.Home, { fragment: PageAnchor.Experiences }),
    );
    this.flowTitle = dto.flowTitle;
    this.flow = dto.flow.map((step) => ({
      ...step,
      duration: `${String(step.minutes)} ${dto.flowUnit}`,
    }));
  }
}
