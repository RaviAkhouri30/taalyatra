import { type DocumentFields } from '@core/interfaces/i-document-store';
import { HomeSection } from '@shared/enums/home-section.enum';
import { PromotionStatus } from '@shared/enums/promotion-status.enum';
import { SitePage } from '@shared/enums/site-page.enum';
import { SiteWidget } from '@shared/enums/site-widget.enum';
import { type IPromotionDto } from '@shared/interfaces/i-site-config';
import { PromotionSchedule } from '@shared/models/promotion-schedule.model';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { fieldOf } from '../forms/json-node';
import { formatDay, formatMoment } from './editor-dates';
import { type IPublishIssue } from './i-publish-issue';
import { type IPublishRecord } from './i-publish-record';

/** What the dashboard is built from. */
export interface IDashboardSource {
  readonly changeCount: number;
  readonly lastPublish: IPublishRecord | null;
  readonly siteConfig: DocumentFields | null;
  readonly visibility: DocumentFields | null;
  readonly warnings: readonly IPublishIssue[];
  readonly now: Date;
}

function plural(count: number, one: string, many: string): string {
  return `${String(count)} ${count === 1 ? one : many}`;
}

/** The editor's home (0008 D19): where things stand, with a sentence per card. */
export class DashboardModel {
  public readonly changeCount: number;
  public readonly changes: string;
  public readonly offerStatus: PromotionStatus;
  public readonly offer: string;
  public readonly hidden: string;
  public readonly lastPublished: string;
  public readonly warnings: readonly IPublishIssue[];

  /** @param source What the dashboard is built from. */
  public constructor(source: IDashboardSource) {
    this.changeCount = source.changeCount;
    this.changes =
      source.changeCount === 0
        ? 'Everything is published.'
        : `${plural(source.changeCount, 'document has', 'documents have')} unpublished changes.`;
    const promotion = fieldOf(source.siteConfig, 'promotion') as IPromotionDto | undefined;
    this.offerStatus = promotion
      ? new PromotionSchedule(promotion).status(source.now)
      : PromotionStatus.Off;
    this.offer = DashboardModel.offerText(this.offerStatus, promotion);
    this.hidden = DashboardModel.hiddenText(new SiteVisibility(source.visibility ?? {}));
    this.lastPublished = source.lastPublish
      ? `Last published ${formatMoment(source.lastPublish.publishedAt)}.`
      : 'Nothing published from the editor yet.';
    this.warnings = source.warnings;
  }

  private static offerText(status: PromotionStatus, promotion: IPromotionDto | undefined): string {
    switch (status) {
      case PromotionStatus.Live:
        return promotion?.endsOn
          ? `Live until ${formatDay(promotion.endsOn)}.`
          : 'Live, with no end date.';
      case PromotionStatus.Scheduled:
        return `Scheduled to start on ${formatDay(promotion?.startsOn ?? '')}.`;
      case PromotionStatus.Ended:
        return `Ended on ${formatDay(promotion?.endsOn ?? '')}.`;
      default:
        return 'Switched off.';
    }
  }

  private static hiddenText(visibility: SiteVisibility): string {
    const sections = Object.values(HomeSection).filter(
      (key) => !visibility.isSectionVisible(key),
    ).length;
    const pages = Object.values(SitePage).filter((key) => !visibility.isPageVisible(key)).length;
    const widgets = Object.values(SiteWidget).filter(
      (key) => !visibility.isWidgetVisible(key),
    ).length;
    return sections + pages + widgets === 0
      ? 'Every section, page and widget is on.'
      : `Hidden: ${plural(sections, 'section', 'sections')}, ${plural(pages, 'page', 'pages')}, ${plural(widgets, 'widget', 'widgets')}.`;
  }
}
