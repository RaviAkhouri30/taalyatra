import { type IDraft } from '@core/interfaces/i-draft';
import { formatMoment } from './editor-dates';
import { type IEditorSection } from './i-editor-section';
import { type IPublishRecord } from './i-publish-record';
import { PublishReport } from './publish-report.model';

/** One document with unpublished changes. */
export interface IChangeEntry {
  readonly path: string;
  /** The editor cards that edit it, e.g. "Site details, Contact details". */
  readonly title: string;
  readonly savedAt: string;
}

/** One past publish. */
export interface IHistoryEntry {
  readonly record: IPublishRecord;
  readonly when: string;
  readonly title: string;
}

/** The review & publish page: what will change, what the checks found, and the history. */
export class PublishPageModel {
  public readonly changes: readonly IChangeEntry[];
  public readonly report: PublishReport;
  public readonly history: readonly IHistoryEntry[];
  /** How the confirmation sums the publish up, e.g. "Publish 2 changed documents?". */
  public readonly confirmText: string;

  /**
   * @param drafts The drafts, by path.
   * @param history The publish history, newest first.
   * @param sections Every editor section.
   * @param now The current time.
   */
  public constructor(
    public readonly drafts: ReadonlyMap<string, IDraft>,
    history: readonly IPublishRecord[],
    private readonly sections: readonly IEditorSection[],
    now: Date,
  ) {
    this.changes = [...drafts.values()].map((draft) => ({
      path: draft.path,
      title: this.titleOf(draft.path),
      savedAt: formatMoment(draft.savedAt),
    }));
    this.report = PublishReport.check(drafts, sections, now);
    this.history = history.map((record) => ({
      record,
      when: formatMoment(record.publishedAt),
      title: record.changed.map((path) => this.titleOf(path)).join('; '),
    }));
    const count = drafts.size;
    this.confirmText = `Publish ${String(count)} changed ${count === 1 ? 'document' : 'documents'}? Visitors see the changes on their next visit.`;
  }

  /** @returns The cards that edit a document, or its path when no card does. */
  private titleOf(path: string): string {
    const titles = new Map<string, string[]>();
    for (const section of this.sections) {
      titles.set(section.path, [...(titles.get(section.path) ?? []), section.title]);
    }
    return titles.get(path)?.join(', ') ?? path;
  }
}
