import { type DocumentFields } from '@core/interfaces/i-document-store';
import { HomeSection } from '@shared/enums/home-section.enum';
import { PromotionStatus } from '@shared/enums/promotion-status.enum';
import { SitePage } from '@shared/enums/site-page.enum';
import { SiteWidget } from '@shared/enums/site-widget.enum';
import { type IPromotionDto } from '@shared/interfaces/i-site-config';
import { PromotionSchedule } from '@shared/models/promotion-schedule.model';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { fieldOf } from '../forms/json-node';
import { ApprovalStatus, type IApproval } from './approval.model';
import { BackupStatus } from './backup-status.model';
import { formatDay, formatMoment } from './editor-dates';
import { type IPublishIssue } from './i-publish-issue';
import { type IPublishRecord } from './i-publish-record';
import { EditorTab } from './editor-tab.enum';
import { ManagerArea } from './manager-area.enum';
import { type Lead, LeadStatus } from './lead.model';
import { type Permissions } from './permissions.model';
import { type IUnseenApprovals, unseenApprovalsText } from './self-approvals';
import { superNotice } from './super-manager';
import { type IVisitDay } from './visit-days';
import { recentVisitsText } from './visits-page.model';

/** What the dashboard is built from. */
export interface IDashboardSource {
  readonly changeCount: number;
  readonly lastPublish: IPublishRecord | null;
  readonly siteConfig: DocumentFields | null;
  readonly visibility: DocumentFields | null;
  readonly warnings: readonly IPublishIssue[];
  /** When the last backup was made, or `null` for never (0016 V13). */
  readonly lastBackupAt: string | null;
  /** Every day's visits and today, or `null` when they couldn't be read (0018). */
  readonly visits: { readonly days: readonly IVisitDay[]; readonly today: string } | null;
  /** Every lead, newest first, or `null` when they couldn't be read (0018). */
  readonly leads: readonly Lead[] | null;
  readonly now: Date;
  /** Who is looking (0019): a manager sees their own pages and requests only. */
  readonly permissions: Permissions;
  /** Every approval request (empty when they couldn't be read). */
  readonly requests: readonly IApproval[];
  /** For the owner, managers' approvals since they last looked (0023 D3, 0024 D6); none for others. */
  readonly unseenApprovals?: IUnseenApprovals;
}

/** Which cards the account sees, and its approvals in words (0019). */
export interface IDashboardAccess {
  readonly owner: boolean;
  /** The owner's areas this account may use (0022): their cards show only then. */
  readonly backups: boolean;
  readonly leads: boolean;
  readonly visits: boolean;
  readonly canSeeOffer: boolean;
  readonly canSeeVisibility: boolean;
  /** The approvals card: always for a manager, for the owner only when something waits. */
  readonly showApprovals: boolean;
  readonly approvalsHeading: string;
  readonly approvals: string;
}

const NONE_UNSEEN: IUnseenApprovals = { self: 0, forOwner: 0 };

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
  /** "2 changes self-approved and 1 approved for you since you last looked", or empty (0023, 0024). */
  public readonly selfApproved: string;
  public readonly warnings: readonly IPublishIssue[];
  /** For a super manager, that they stand in for the owner and until when (0024 D8); else empty. */
  public readonly superNotice: string;
  public readonly backup: BackupStatus;
  /** Visits in the last week, in words. */
  public readonly visits: string;
  /** How many leads are still new. */
  public readonly newLeads: number;
  /** The leads in words: how many are new, and the newest. */
  public readonly leads: string;
  /** Which cards the account sees, and its approvals (0019). */
  public readonly access: IDashboardAccess;

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
    this.selfApproved = unseenApprovalsText(source.unseenApprovals ?? NONE_UNSEEN);
    this.warnings = source.warnings;
    const { permissions } = source;
    this.superNotice = superNotice(permissions.isSuper, permissions.superEndsAt, source.now);
    this.backup = new BackupStatus(source.lastBackupAt, source.now);
    this.visits = source.visits
      ? recentVisitsText(source.visits.days, source.visits.today)
      : 'Couldn’t read the visits just now.';
    this.newLeads = source.leads?.filter((lead) => lead.status === LeadStatus.New).length ?? 0;
    this.leads = DashboardModel.leadsText(source.leads, this.newLeads);
    this.access = DashboardModel.accessOf(source);
  }

  private static accessOf(source: IDashboardSource): IDashboardAccess {
    const { permissions } = source;
    // A super manager sees the queue and restores backups as the owner does (0024).
    const owner = permissions.actsAsOwner;
    const waiting = source.requests.filter((request) => request.status === ApprovalStatus.Waiting);
    return {
      owner,
      backups: permissions.canUse(ManagerArea.Backups),
      leads: permissions.canUse(ManagerArea.Leads),
      visits: permissions.canUse(ManagerArea.Visits),
      canSeeOffer: permissions.canSee(EditorTab.Offer),
      canSeeVisibility: permissions.canSee(EditorTab.Visibility),
      showApprovals: !owner || waiting.length > 0,
      approvalsHeading: owner ? 'Waiting for approval' : 'Your requests',
      approvals: owner
        ? `${plural(waiting.length, 'change waits', 'changes wait')} for your approval.`
        : DashboardModel.requestsText(source),
    };
  }

  private static requestsText(source: IDashboardSource): string {
    const own = source.requests.filter((request) => request.by === source.permissions.uid);
    const waiting = own.filter((request) => request.status === ApprovalStatus.Waiting).length;
    const sentBack = own.filter((request) => request.status === ApprovalStatus.SentBack).length;
    if (waiting + sentBack === 0) {
      return 'Nothing waiting for the owner. Changes on pages that need approval are sent from Review & publish.';
    }
    return `${plural(waiting, 'change waits', 'changes wait')} for the owner; ${plural(sentBack, 'was', 'were')} sent back to you.`;
  }

  private static leadsText(leads: readonly Lead[] | null, fresh: number): string {
    if (leads === null) {
      return 'Couldn’t read the leads just now.';
    }
    const newest = leads[0];
    if (newest === undefined) {
      return 'No proposals yet.';
    }
    const waiting =
      fresh === 0 ? 'Every lead is followed up.' : `${plural(fresh, 'lead is', 'leads are')} new.`;
    return `${waiting} The latest is from ${newest.name}, ${newest.received}.`;
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
      ? 'Everything is showing: every section, page and button.'
      : `Hidden: ${plural(sections, 'section', 'sections')}, ${plural(pages, 'page', 'pages')}, ${plural(widgets, 'button or bar', 'buttons or bars')}.`;
  }
}
