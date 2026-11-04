import { type DocumentFields } from '@core/interfaces/i-document-store';
import { PromotionSchedule } from '@shared/models/promotion-schedule.model';
import { COLLECTION_ITEMS_FIELD } from './collection-expander';
import { ContentPath } from './content-path.enum';
import { fieldErrorMessage } from '../forms/field-errors';
import { fieldOf } from '../forms/json-node';
import { placeholderMessage } from '../forms/placeholder';
import { buildControl } from '../forms/schema-control.factory';
import { schemaLeaves } from '../forms/schema-leaves';
import { sectionContent } from '../forms/schema-value';
import { type IEditorSection } from './i-editor-section';
import { imageUsesIn } from './media-use';
import { type IPublishIssue } from './i-publish-issue';
import { IssueSeverity } from './issue-severity.enum';

/** " · ", between a use's section and field. */
const LABEL_SEPARATOR_LENGTH = 3;

/** One pre-publish check over a drafted section (open/closed: add a rule, change nothing else). */
export interface IPublishRule {
  /**
   * @param section The editor section.
   * @param content Its document, as it will be published.
   * @param now The current time.
   * @param libraryIds The library's entries, or `null` when they aren't known.
   * @returns What the rule found.
   */
  check(
    section: IEditorSection,
    content: DocumentFields,
    now: Date,
    libraryIds: ReadonlySet<string> | null,
  ): IPublishIssue[];
}

/** The same validation the form shows: required, length and format. Blocks publishing. */
export class SchemaRule implements IPublishRule {
  public check(section: IEditorSection, content: DocumentFields): IPublishIssue[] {
    return schemaLeaves(section.fields, sectionContent(section, content)).flatMap((leaf) => {
      const message = fieldErrorMessage(buildControl(leaf.field, leaf.value).errors);
      return message === null
        ? []
        : [
            {
              severity: IssueSeverity.Error,
              sectionId: section.id,
              section: section.title,
              field: leaf.label,
              message,
            },
          ];
    });
  }
}

/** Copy still marked as unfinished. A warning: brackets can be intended. */
export class PlaceholderRule implements IPublishRule {
  public check(section: IEditorSection, content: DocumentFields): IPublishIssue[] {
    return schemaLeaves(section.fields, sectionContent(section, content)).flatMap((leaf) => {
      const message = placeholderMessage(leaf.value);
      return message === null
        ? []
        : [
            {
              severity: IssueSeverity.Warning,
              sectionId: section.id,
              section: section.title,
              field: leaf.label,
              message,
            },
          ];
    });
  }
}

/**
 * An uploaded image that's no longer in the library. Undo can bring one back from history after its
 * file was deleted, and publishing it would show visitors a broken image (D18).
 */
export class ImageInLibraryRule implements IPublishRule {
  public check(
    section: IEditorSection,
    content: DocumentFields,
    _now: Date,
    libraryIds: ReadonlySet<string> | null,
  ): IPublishIssue[] {
    if (libraryIds === null) {
      return [];
    }
    return imageUsesIn(section, content)
      .filter((use) => !libraryIds.has(use.id))
      .map((use) => ({
        severity: IssueSeverity.Error,
        sectionId: section.id,
        section: section.title,
        field: use.label.slice(section.title.length + LABEL_SEPARATOR_LENGTH),
        message: 'This photo was deleted from the library. Choose another.',
      }));
  }
}

/** More than one featured show: the site has one spotlight, so it can't show them all (D21). */
export class OneFeaturedShowRule implements IPublishRule {
  public check(section: IEditorSection, content: DocumentFields): IPublishIssue[] {
    if (section.path !== ContentPath.ShowFormats) {
      return [];
    }
    const shows = fieldOf(content, COLLECTION_ITEMS_FIELD);
    const featured = (Array.isArray(shows) ? shows : []).filter(
      (show: unknown) => fieldOf(show, 'featured') === true,
    );
    return featured.length > 1
      ? [
          {
            severity: IssueSeverity.Error,
            sectionId: section.id,
            section: section.title,
            field: 'Featured',
            message: 'Only one show can be featured. Switch the others off.',
          },
        ]
      : [];
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
    return { severity, sectionId: section.id, section: section.title, field: 'Ends on', message };
  }
}
