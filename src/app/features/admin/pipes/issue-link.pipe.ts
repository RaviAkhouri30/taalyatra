import { Pipe, type PipeTransform } from '@angular/core';
import { type IPublishIssue } from '../models/i-publish-issue';
import { type IIssueLink, issueLink } from '../schemas/editor-tabs';

/** Where the owner goes to fix a publish finding. */
@Pipe({ name: 'issueLink' })
export class IssueLinkPipe implements PipeTransform {
  /**
   * @param issue A publish finding.
   * @returns Its tab and card, or `null` when no tab edits that section.
   */
  public transform(issue: IPublishIssue): IIssueLink | null {
    return issueLink(issue.sectionId);
  }
}
