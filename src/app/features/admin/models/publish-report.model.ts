import { type IDraft } from './i-draft';
import { type IEditorSection } from './i-editor-section';
import { type IPublishIssue } from './i-publish-issue';
import { IssueSeverity } from './issue-severity.enum';
import {
  type IPublishRule,
  PlaceholderRule,
  PromotionDatesRule,
  SchemaRule,
} from './publish-rules';

/** What the pre-publish checks found across the drafted sections (0008 D18). */
export class PublishReport {
  /** The checks, in the order their findings are listed. */
  public static readonly rules: readonly IPublishRule[] = [
    new SchemaRule(),
    new PromotionDatesRule(),
    new PlaceholderRule(),
  ];

  /** Findings that block publishing. */
  public readonly errors: readonly IPublishIssue[];
  /** Findings the owner may publish anyway. */
  public readonly warnings: readonly IPublishIssue[];

  /** @param issues Everything found. */
  public constructor(issues: readonly IPublishIssue[]) {
    this.errors = issues.filter((issue) => issue.severity === IssueSeverity.Error);
    this.warnings = issues.filter((issue) => issue.severity === IssueSeverity.Warning);
  }

  /** Whether nothing blocks publishing. */
  public get canPublish(): boolean {
    return this.errors.length === 0;
  }

  /**
   * @param drafts The drafts about to be published, by path.
   * @param sections Every editor section.
   * @param now The current time.
   * @returns What every rule found in every section that has a draft.
   */
  public static check(
    drafts: ReadonlyMap<string, IDraft>,
    sections: readonly IEditorSection[],
    now: Date,
  ): PublishReport {
    return new PublishReport(
      sections.flatMap((section) => {
        const draft = drafts.get(section.path);
        return draft === undefined
          ? []
          : PublishReport.rules.flatMap((rule) => rule.check(section, draft.content, now));
      }),
    );
  }
}
