import { type DocumentFields } from '@core/interfaces/i-document-store';
import { PromotionSchedule } from '@shared/models/promotion-schedule.model';
import { fieldErrorMessage } from '../forms/field-errors';
import { fieldOf } from '../forms/json-node';
import { buildControl } from '../forms/schema-control.factory';
import { schemaLeaves } from '../forms/schema-leaves';
import { type IEditorSection } from './i-editor-section';
import { type IPublishIssue } from './i-publish-issue';
import { IssueSeverity } from './issue-severity.enum';

/** Text in square brackets, the way unfinished copy is marked, e.g. "[Add duration & price]". */
const PLACEHOLDER = /\[[^\]\n]{1,80}\]/;

/** One pre-publish check over a drafted section (open/closed: add a rule, change nothing else). */
export interface IPublishRule {
  /**
   * @param section The editor section.
   * @param content Its document, as it will be published.
   * @param now The current time.
   * @returns What the rule found.
   */
  check(section: IEditorSection, content: DocumentFields, now: Date): IPublishIssue[];
}

/** The same validation the form shows: required, length and format. Blocks publishing. */
export class SchemaRule implements IPublishRule {
  public check(section: IEditorSection, content: DocumentFields): IPublishIssue[] {
    return schemaLeaves(section.fields, content).flatMap((leaf) => {
      const message = fieldErrorMessage(buildControl(leaf.field, leaf.value).errors);
      return message === null
        ? []
        : [{ severity: IssueSeverity.Error, section: section.title, field: leaf.label, message }];
    });
  }
}

/** Copy still marked as unfinished. A warning: brackets can be intended. */
export class PlaceholderRule implements IPublishRule {
  public check(section: IEditorSection, content: DocumentFields): IPublishIssue[] {
    return schemaLeaves(section.fields, content).flatMap((leaf) => {
      const found = typeof leaf.value === 'string' ? PLACEHOLDER.exec(leaf.value) : null;
      return found === null
        ? []
        : [
            {
              severity: IssueSeverity.Warning,
              section: section.title,
              field: leaf.label,
              message: `Still has a placeholder: “${found[0]}”.`,
            },
          ];
    });
  }
}

/** An offer whose dates contradict each other (error) or have already passed (warning). */
export class PromotionDatesRule implements IPublishRule {
  public check(section: IEditorSection, content: DocumentFields, now: Date): IPublishIssue[] {
    if (!section.fields.some((field) => field.key === 'promotion')) {
      return [];
    }
    const promotion = fieldOf(content, 'promotion');
    const startsOn = fieldOf(promotion, 'startsOn');
    const endsOn = fieldOf(promotion, 'endsOn');
    if (typeof endsOn !== 'string') {
      return [];
    }
    if (typeof startsOn === 'string' && endsOn < startsOn) {
      return [this.issue(section, IssueSeverity.Error, 'The offer ends before it starts.')];
    }
    const ended = fieldOf(promotion, 'live') !== false && endsOn < PromotionSchedule.siteDay(now);
    return ended
      ? [
          this.issue(
            section,
            IssueSeverity.Warning,
            'This offer has ended, so visitors won’t see it.',
          ),
        ]
      : [];
  }

  private issue(section: IEditorSection, severity: IssueSeverity, message: string): IPublishIssue {
    return { severity, section: section.title, field: 'Ends on', message };
  }
}
