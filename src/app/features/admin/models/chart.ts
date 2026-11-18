import {
  addDays,
  addMonths,
  longMonth,
  monthOf,
  shortDay,
  shortMonth,
  weekOf,
  yearOf,
} from './site-days';

/** How a graph groups its numbers (0018 V11). */
export enum ChartPeriod {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year',
}

/** The period switch's choices, in order. */
export const CHART_PERIOD_CHOICES: readonly {
  readonly period: ChartPeriod;
  readonly label: string;
}[] = [
  { period: ChartPeriod.Day, label: 'By day' },
  { period: ChartPeriod.Week, label: 'By week' },
  { period: ChartPeriod.Month, label: 'By month' },
  { period: ChartPeriod.Year, label: 'By year' },
];

/** What's counted, in the owner's words, e.g. "visit" / "visits". */
export interface INoun {
  readonly one: string;
  readonly many: string;
}

/** One bar. */
export interface IBar {
  /** Its period: a day, a week's Monday, a month (`YYYY-MM`) or a year. */
  readonly key: string;
  /** Under the bar, e.g. "18 Nov". */
  readonly label: string;
  /** The period in full, for the numbers table. */
  readonly title: string;
  /** `null` before counting began: not zero, just not known. */
  readonly value: number | null;
}

/** A graph, with the sentence that sums it up. */
export interface IChart {
  readonly bars: readonly IBar[];
  readonly total: number;
  readonly summary: string;
  /** The tallest bar's value, at least 1, so the bars scale to it. */
  readonly max: number;
}

/** What a graph is drawn from. */
export interface IChartSource {
  /** Counts by day (`YYYY-MM-DD`, in India). */
  readonly daily: ReadonlyMap<string, number>;
  readonly today: string;
  /** The first day counted, or `null` when everything was always counted (proposals). */
  readonly since: string | null;
  readonly noun: INoun;
}

const DAYS_PER_WEEK = 7;

/** How one period groups, steps, starts and is labelled. */
interface IPeriodRules {
  /** The period a day falls in, as its key. */
  readonly bucket: (day: string) => string;
  /** The period `count` periods away from `key`. */
  readonly step: (key: string, count: number) => string;
  /** The first day of a period. */
  readonly start: (key: string) => string;
  readonly label: (key: string) => Pick<IBar, 'label' | 'title'>;
  /** How many bars it shows, and what they're called; `null` for every year since counting began. */
  readonly range: { readonly bars: number; readonly words: string } | null;
}

const DAY_RULES: IPeriodRules = {
  bucket: (day) => day,
  step: addDays,
  start: (key) => key,
  label: (key) => ({ label: shortDay(key), title: `${shortDay(key)} ${yearOf(key)}` }),
  range: { bars: 30, words: '30 days' },
};

/** Each period's rules, so a new period is a new entry, not a new branch. */
const PERIOD_RULES = new Map<ChartPeriod, IPeriodRules>([
  [ChartPeriod.Day, DAY_RULES],
  [
    ChartPeriod.Week,
    {
      bucket: weekOf,
      step: (key, count) => addDays(key, count * DAYS_PER_WEEK),
      start: (key) => key,
      label: (key) => ({
        label: shortDay(key),
        title: `Week from ${shortDay(key)} ${yearOf(key)}`,
      }),
      range: { bars: 12, words: '12 weeks' },
    },
  ],
  [
    ChartPeriod.Month,
    {
      bucket: monthOf,
      step: addMonths,
      start: (key) => `${key}-01`,
      label: (key) => ({ label: shortMonth(key), title: longMonth(key) }),
      range: { bars: 12, words: '12 months' },
    },
  ],
  [
    ChartPeriod.Year,
    {
      bucket: yearOf,
      step: (key, count) => String(Number(key) + count),
      start: (key) => `${key}-01-01`,
      label: (key) => ({ label: key, title: key }),
      range: null,
    },
  ],
]);

function rulesOf(period: ChartPeriod): IPeriodRules {
  return PERIOD_RULES.get(period) ?? DAY_RULES;
}

/** @returns The period a day falls in, as its key. */
export function bucketOf(period: ChartPeriod, day: string): string {
  return rulesOf(period).bucket(day);
}

/** @returns The first day of a period. */
export function startOf(period: ChartPeriod, key: string): string {
  return rulesOf(period).start(key);
}

/**
 * @param period How the graph groups.
 * @param source What it's drawn from.
 * @returns The periods shown, oldest first.
 */
export function chartKeys(period: ChartPeriod, source: IChartSource): string[] {
  const rules = rulesOf(period);
  const last = rules.bucket(source.today);
  const count =
    rules.range?.bars ?? Number(last) - Number(yearOf(source.since ?? firstDay(source))) + 1;
  return Array.from({ length: count }, (_, index) => rules.step(last, index - count + 1));
}

function firstDay(source: IChartSource): string {
  return (
    [...source.daily.keys()].sort((left, right) => left.localeCompare(right))[0] ?? source.today
  );
}

function sums(rules: IPeriodRules, daily: ReadonlyMap<string, number>): Map<string, number> {
  const totals = new Map<string, number>();
  for (const [day, value] of daily) {
    const key = rules.bucket(day);
    totals.set(key, (totals.get(key) ?? 0) + value);
  }
  return totals;
}

function counted(count: number, noun: INoun): string {
  return `${count.toLocaleString('en-IN')} ${count === 1 ? noun.one : noun.many}`;
}

/**
 * @param total This period's number.
 * @param previous The period before's.
 * @returns How they compare, e.g. "up from".
 */
export function comparison(total: number, previous: number): string {
  if (total === previous) {
    return 'the same as';
  }
  return total > previous ? 'up from' : 'down from';
}

function summary(
  rules: IPeriodRules,
  source: IChartSource,
  total: number,
  previous: number | null,
): string {
  if (rules.range === null) {
    const since = source.since === null ? 'in all' : 'since counting began';
    return `${counted(total, source.noun)} ${since}.`;
  }
  const head = `${counted(total, source.noun)} in the last ${rules.range.words}`;
  return previous === null
    ? `${head}.`
    : `${head}, ${comparison(total, previous)} ${previous.toLocaleString('en-IN')} the ${rules.range.words} before.`;
}

/**
 * @param period How the graph groups.
 * @param source What it's drawn from.
 * @returns The graph: its bars, total and summing-up sentence.
 */
export function buildChart(period: ChartPeriod, source: IChartSource): IChart {
  const rules = rulesOf(period);
  const totals = sums(rules, source.daily);
  const keys = chartKeys(period, source);
  const firstCounted = source.since === null ? null : rules.bucket(source.since);
  const bars = keys.map((key) => ({
    key,
    ...rules.label(key),
    value: firstCounted !== null && key < firstCounted ? null : (totals.get(key) ?? 0),
  }));
  const total = bars.reduce((sum, bar) => sum + (bar.value ?? 0), 0);
  // Compared only with a period that was counted in full, so "up from" is never misleading.
  const before = keys.map((key) => rules.step(key, -keys.length));
  const comparable =
    rules.range !== null && (firstCounted === null || (before[0] ?? '') >= firstCounted);
  const previous = comparable ? before.reduce((sum, key) => sum + (totals.get(key) ?? 0), 0) : null;
  return {
    bars,
    total,
    summary: summary(rules, source, total, previous),
    max: Math.max(1, ...bars.map((bar) => bar.value ?? 0)),
  };
}
