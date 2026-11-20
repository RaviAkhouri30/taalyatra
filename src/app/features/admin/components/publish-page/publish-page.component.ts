import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from '@shared/directives/button.directive';
import { IssueLinkPipe } from '../../pipes/issue-link.pipe';
import { APPROVAL_NOTE_MAX } from '../../models/approval.model';
import { DraftAction } from '../../models/permissions.model';
import { ApprovalsPanelComponent } from '../approvals-panel/approvals-panel.component';
import { BackupPanelComponent } from '../backup-panel/backup-panel.component';
import { PublishHistoryComponent } from '../publish-history/publish-history.component';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';
import { type PublishPageModel } from '../../models/publish-page.model';
import {
  PublishPageViewModel,
  SELF_APPROVAL_TITLE_MAX,
} from '../../view-models/publish-page.view-model';

/**
 * Review & publish: the changes and who made them, what the checks found, publishing or sending for
 * approval, the approval requests, backups and the history.
 */
@Component({
  selector: 'app-publish-page',
  imports: [
    ApprovalsPanelComponent,
    BackupPanelComponent,
    ButtonDirective,
    IssueLinkPipe,
    PublishHistoryComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './publish-page.component.html',
  styleUrl: './publish-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PublishPageViewModel],
})
export default class PublishPageComponent extends BaseComponent<PublishPageModel> {
  protected override readonly model = inject(PublishPageViewModel);
  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly compact = ButtonSize.Compact;
  protected readonly needsApproval = DraftAction.Approval;
  protected readonly noteMax = APPROVAL_NOTE_MAX;
  protected readonly titleMax = SELF_APPROVAL_TITLE_MAX;
}
