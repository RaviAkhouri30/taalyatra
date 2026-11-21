import { type AiCounts, type ILeadsSummary } from '@core/interfaces/i-ai-service';
import { type Lead } from './lead.model';

/** What `api/` accepts per group: at most 40 labels of at most 60 characters. */
const MAX_LABELS = 40;
const MAX_LABEL_LENGTH = 60;
const NOT_GIVEN = 'Not given';
const OTHER = 'Other';
/** `YYYY-MM` at the start of a date the visitor gave; anything else isn't sent. */
const MONTH_AT_START = /^(\d{4}-\d{2})-/u;

/** @returns The event's month, only when the date is a plain `YYYY-MM-DD`: free text never goes. */
function eventMonth(lead: Lead): string {
  return MONTH_AT_START.exec(lead.date)?.[1] ?? NOT_GIVEN;
}

/**
 * @param labels One label per lead.
 * @returns How many have each, the most common first; past the function's limit, the rest are
 *   counted together as "Other".
 */
export function countLabels(labels: readonly string[]): AiCounts {
  const counts = new Map<string, number>();
  labels.forEach((label) => {
    const key = (label.trim() || NOT_GIVEN).slice(0, MAX_LABEL_LENGTH);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  const sorted = [...counts].sort((first, second) => second[1] - first[1]);
  if (sorted.length <= MAX_LABELS) {
    return Object.fromEntries(sorted);
  }
  const kept = sorted.slice(0, MAX_LABELS - 1);
  const rest = sorted.slice(MAX_LABELS - 1).reduce((sum, [, count]) => sum + count, 0);
  return Object.fromEntries([...kept, [OTHER, rest]]);
}

/**
 * The leads as counts only (0025 V12, D3). It reads only the fields listed here: never the name,
 * phone, email, what they need, or their message.
 * @param leads The leads to analyse, e.g. those the filters show.
 * @returns The summary `api/` accepts.
 */
export function leadsSummary(leads: readonly Lead[]): ILeadsSummary {
  return {
    total: leads.length,
    byStatus: countLabels(leads.map((lead) => lead.status)),
    byEventType: countLabels(leads.map((lead) => lead.eventType)),
    byExperience: countLabels(leads.map((lead) => lead.experience)),
    byGroupSize: countLabels(leads.map((lead) => lead.groupSize)),
    byEventMonth: countLabels(leads.map(eventMonth)),
    byReceivedMonth: countLabels(leads.map((lead) => lead.month)),
  };
}
