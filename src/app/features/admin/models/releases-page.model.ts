import { formatDay } from './editor-dates';
import { type IRelease, type ITextPart } from './release-notes';

/** How many of the newest release's notes the dashboard shows. */
export const DASHBOARD_RELEASE_NOTES = 3;

/** The longest a note's headline runs on the dashboard before it's cut, in characters. */
export const NOTE_HEADLINE_MAX = 90;

/** The newest release, in brief, for the dashboard (0016 V1). */
export interface IReleaseSummary {
  readonly version: string;
  readonly when: string;
  /** Its first few notes, each by its headline only. */
  readonly notes: readonly string[];
}

/**
 * @param note A note's text runs.
 * @returns Its headline: the bold lead it opens with, else its first sentence, cut to fit.
 */
export function noteHeadline(note: readonly ITextPart[]): string {
  const [first] = note;
  if (first?.strong) {
    return first.text.trim();
  }
  const text = note
    .map((part) => part.text)
    .join('')
    .trim();
  const sentence = text.split(/[.:]\s/)[0] ?? text;
  return sentence.length > NOTE_HEADLINE_MAX
    ? `${sentence.slice(0, NOTE_HEADLINE_MAX).trimEnd()}…`
    : sentence;
}

/**
 * @param release A release.
 * @returns It in brief: its version, day and the headlines of its first few notes.
 */
export function summarizeRelease(release: IRelease): IReleaseSummary {
  return {
    version: release.version,
    when: formatDay(release.date),
    notes: release.groups
      .flatMap((group) => group.items)
      .slice(0, DASHBOARD_RELEASE_NOTES)
      .map(noteHeadline),
  };
}

/** One release on What's new, with its day as the owner reads it. */
export interface IReleaseEntry {
  readonly release: IRelease;
  /** e.g. "18 Nov 2026". */
  readonly when: string;
}

/** What's new (0016 V1): every release, newest first. */
export class ReleasesPageModel {
  public readonly entries: readonly IReleaseEntry[];

  /** @param releases Every release, newest first. */
  public constructor(releases: readonly IRelease[]) {
    this.entries = releases.map((release) => ({ release, when: formatDay(release.date) }));
  }
}
