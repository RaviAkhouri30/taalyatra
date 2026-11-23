import { VISIT_DEVICES, VISIT_PAGES } from '@shared/constants/visit.constants';
import { AppRoute } from '@shared/enums/app-route.enum';
import {
  type ChartPeriod,
  type IChart,
  type IChartSource,
  buildChart,
  chartKeys,
  comparison,
  startOf,
} from './chart';
import { formatDay } from './editor-dates';
import { addDays } from './site-days';
import { type IVisitDay } from './visit-days';

/** The pages visitors arrive on, as the owner calls them. */
const PAGE_NAMES: Readonly<Record<string, string>> = {
  [AppRoute.Home]: 'Home page',
  [AppRoute.Shows]: 'Shows',
  [AppRoute.Videos]: 'Videos',
  [AppRoute.Team]: 'Team',
  [AppRoute.Achievements]: 'Achievements',
};

const DEVICE_NAMES: Readonly<Record<string, string>> = {
  phone: 'Phone',
  tablet: 'Tablet',
  desktop: 'Computer',
};

const PERCENT = 100;

/** One line of a breakdown, e.g. "Home page: 120 (64 %)". */
export interface IBreakdownRow {
  readonly name: string;
  readonly count: number;
  /** Its share of the period's visits, a whole percentage. */
  readonly share: number;
}

/** The Visits page's numbers (0018 V11), from which each period's graphs are drawn. */
export class VisitsPageModel {
  /** When counting began, in words, or `null` before the first visit. */
  public readonly countedSince: string | null;

  private readonly since: string | null;
  private readonly visits: ReadonlyMap<string, number>;

  /**
   * @param days Every day's visits, oldest first.
   * @param proposals Proposals received, by day.
   * @param today Today, in India.
   */
  public constructor(
    private readonly days: readonly IVisitDay[],
    private readonly proposals: ReadonlyMap<string, number>,
    private readonly today: string,
  ) {
    this.since = days[0]?.day ?? null;
    this.countedSince = this.since && formatDay(this.since);
    this.visits = new Map(days.map((day) => [day.day, day.total]));
  }

  /** @returns The visits graph for the period. Before any visit, every bar is "not counted". */
  public visitsChart(period: ChartPeriod): IChart {
    return buildChart(period, this.visitSource());
  }

  /** @returns The proposals graph for the period. */
  public proposalsChart(period: ChartPeriod): IChart {
    return buildChart(period, {
      daily: this.proposals,
      today: this.today,
      since: null,
      noun: { one: 'proposal', many: 'proposals' },
    });
  }

  /** @returns The pages visitors arrived on in the period, most first. */
  public pages(period: ChartPeriod): readonly IBreakdownRow[] {
    return this.breakdown(period, VISIT_PAGES, (day) => day.pages, PAGE_NAMES);
  }

  /** @returns Visits by kind of device in the period, most first. */
  public devices(period: ChartPeriod): readonly IBreakdownRow[] {
    return this.breakdown(period, VISIT_DEVICES, (day) => day.devices, DEVICE_NAMES);
  }

  private breakdown(
    period: ChartPeriod,
    keys: readonly string[],
    countsOf: (day: IVisitDay) => Readonly<Record<string, number>>,
    names: Readonly<Record<string, string>>,
  ): readonly IBreakdownRow[] {
    const first = chartKeys(period, this.visitSource())[0] ?? this.today;
    const start = startOf(period, first);
    const inPeriod = this.days.filter((day) => day.day >= start);
    const totals = keys.map((key) => ({
      key,
      count: inPeriod.reduce(
        (sum, day) => sum + (new Map(Object.entries(countsOf(day))).get(key) ?? 0),
        0,
      ),
    }));
    const all = totals.reduce((sum, row) => sum + row.count, 0);
    return totals
      .filter((row) => row.count > 0)
      .sort((first, second) => second.count - first.count)
      .map((row) => ({
        name: new Map(Object.entries(names)).get(row.key) ?? row.key,
        count: row.count,
        share: Math.round((row.count / all) * PERCENT),
      }));
  }

  private visitSource(): IChartSource {
    return {
      daily: this.visits,
      today: this.today,
      // With nothing counted yet, counting starts today: every earlier bar is "not counted".
      since: this.since ?? this.today,
      noun: { one: 'visit', many: 'visits' },
    };
  }
}

const WEEK_DAYS = 7;

/**
 * The dashboard's line about visits: the last seven days, compared with the seven before when
 * those were counted in full.
 * @param days Every day's visits, oldest first.
 * @param today Today, in India.
 * @returns e.g. "86 visits in the last 7 days, up from 70 the week before."
 */
export function recentVisitsText(days: readonly IVisitDay[], today: string): string {
  const first = days[0]?.day;
  if (first === undefined) {
    return 'No visits counted yet. They appear here from the first one.';
  }
  const weekStart = addDays(today, 1 - WEEK_DAYS);
  const before = addDays(weekStart, -WEEK_DAYS);
  const sum = (from: string, to: string): number =>
    days
      .filter((day) => day.day >= from && day.day < to)
      .reduce((total, day) => total + day.total, 0);
  const recent = sum(weekStart, addDays(today, 1));
  const head = `${recent.toLocaleString('en-IN')} ${recent === 1 ? 'visit' : 'visits'} in the last 7 days`;
  if (first > before) {
    return `${head}.`;
  }
  const previous = sum(before, weekStart);
  return `${head}, ${comparison(recent, previous)} ${previous.toLocaleString('en-IN')} the week before.`;
}

/** One day's visits, for the dashboard's small chart (0030). */
export interface IDayTotal {
  /** `YYYY-MM-DD`. */
  readonly day: string;
  readonly total: number;
}

/**
 * @param days Every day's visits.
 * @param today `YYYY-MM-DD`, in India.
 * @returns The last 7 days, oldest first, with 0 for a day nobody came.
 */
export function lastWeek(days: readonly IVisitDay[], today: string): IDayTotal[] {
  const totals = new Map(days.map((day) => [day.day, day.total]));
  return Array.from({ length: WEEK_DAYS }, (_, index) => {
    const day = addDays(today, index + 1 - WEEK_DAYS);
    return { day, total: totals.get(day) ?? 0 };
  });
}
