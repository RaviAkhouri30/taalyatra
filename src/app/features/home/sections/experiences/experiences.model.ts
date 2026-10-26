import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type IImage } from '@shared/interfaces/i-image';
import { type INavLink } from '@shared/interfaces/i-site-link';
import { navLink } from '@shared/utils/link.util';
import { type IExperienceDto, type IExperiencesDto } from './i-experiences';

/** One experience card: where it links, and which filter categories show it. */
export class ExperienceModel {
  public readonly name: string;
  public readonly tag: string;
  public readonly image: IImage;
  public readonly description: string;
  public readonly specs: readonly string[];

  public constructor(
    dto: IExperienceDto,
    /** Card destination: the details section for the signature experience, else the contact form. */
    public readonly link: INavLink,
    private readonly category: string,
  ) {
    this.name = dto.name;
    this.tag = dto.tag;
    this.image = dto.image;
    this.description = dto.description;
    this.specs = [dto.duration, dto.groupSize, dto.venue];
  }

  /**
   * @param category Selected filter category.
   * @param allLabel Category that matches every experience.
   * @returns Whether this experience appears under `category`.
   */
  public matches(category: string, allLabel: string): boolean {
    return category === allLabel || category === this.category;
  }
}

/** Experiences section: copy, filter chips and the cards each filter shows. */
export class ExperiencesModel {
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly lead: string;
  public readonly filterLabel: string;
  public readonly allLabel: string;
  /** Chip labels, "All" first. */
  public readonly filters: readonly string[];
  public readonly featured: ExperienceModel;
  public readonly featuredCta: string;
  public readonly items: readonly ExperienceModel[];
  public readonly emptyMessage: string;

  public constructor(dto: IExperiencesDto) {
    const details = navLink(dto.featured.name, AppRoute.Home, {
      fragment: PageAnchor.DrumCircleDetails,
    });
    this.eyebrow = dto.eyebrow;
    this.title = dto.title;
    this.lead = dto.lead;
    this.filterLabel = dto.filterLabel;
    this.allLabel = dto.allLabel;
    this.filters = [dto.allLabel, ...dto.categories];
    this.featured = new ExperienceModel(dto.featured, details, dto.featured.category);
    this.featuredCta = dto.featured.cta;
    this.items = dto.items.map(
      (item) =>
        new ExperienceModel(
          item,
          navLink(item.name, AppRoute.Home, { fragment: PageAnchor.Contact }),
          item.category,
        ),
    );
    this.emptyMessage = dto.emptyMessage;
  }
}
