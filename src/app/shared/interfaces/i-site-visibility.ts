import { type HomeSection } from '@shared/enums/home-section.enum';
import { type SitePage } from '@shared/enums/site-page.enum';
import { type SiteWidget } from '@shared/enums/site-widget.enum';

/**
 * Stored shape of `site/visibility`: switches per home section, inner page and site widget.
 * A missing switch means visible, so only what the owner turned off needs storing (ADR-0015).
 */
export interface ISiteVisibilityDto {
  /** Home sections, keyed by {@link HomeSection}. */
  readonly sections?: Readonly<Partial<Record<HomeSection, boolean>>>;
  /** Inner pages, keyed by {@link SitePage}. */
  readonly pages?: Readonly<Partial<Record<SitePage, boolean>>>;
  /** Site-wide elements, keyed by {@link SiteWidget}. */
  readonly widgets?: Readonly<Partial<Record<SiteWidget, boolean>>>;
}
