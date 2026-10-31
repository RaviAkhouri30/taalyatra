import { type HomeSection } from '@shared/enums/home-section.enum';
import { type SitePage } from '@shared/enums/site-page.enum';
import { type SiteWidget } from '@shared/enums/site-widget.enum';
import { type ISiteVisibilityDto } from '@shared/interfaces/i-site-visibility';

/**
 * Answers whether a home section, inner page or site widget is shown. Only an explicit `false`
 * hides something: missing or malformed data shows everything, so a bad write can't blank the
 * site (ADR-0015).
 */
export class SiteVisibility {
  /** Everything shown: the state before the owner switches anything off. */
  public static readonly allVisible = new SiteVisibility({});

  private readonly sections: ReadonlyMap<string, unknown>;
  private readonly pages: ReadonlyMap<string, unknown>;
  private readonly widgets: ReadonlyMap<string, unknown>;

  /** @param dto The stored `site/visibility` document. */
  public constructor(dto: ISiteVisibilityDto) {
    // Maps, not indexed property reads: keys come from enums, but the stored object is untrusted.
    this.sections = new Map(Object.entries(dto.sections ?? {}));
    this.pages = new Map(Object.entries(dto.pages ?? {}));
    this.widgets = new Map(Object.entries(dto.widgets ?? {}));
  }

  /**
   * @param section The home section.
   * @returns Whether it is shown.
   */
  public isSectionVisible(section: HomeSection): boolean {
    return this.sections.get(section) !== false;
  }

  /**
   * @param page The inner page.
   * @returns Whether it is shown and linked.
   */
  public isPageVisible(page: SitePage): boolean {
    return this.pages.get(page) !== false;
  }

  /**
   * @param widget The site-wide element.
   * @returns Whether it is shown.
   */
  public isWidgetVisible(widget: SiteWidget): boolean {
    return this.widgets.get(widget) !== false;
  }
}
