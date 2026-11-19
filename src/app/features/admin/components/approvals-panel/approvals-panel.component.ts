import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { type IApprovalsPanel } from '../../models/approvals-panel.model';
import { ApprovalsPanelViewModel } from '../../view-models/approvals-panel.view-model';
import { ApprovalCardComponent } from '../approval-card/approval-card.component';

/** The approvals on Review & publish (0019): the owner's queue, or a manager's own requests. */
@Component({
  selector: 'app-approvals-panel',
  imports: [ApprovalCardComponent],
  templateUrl: './approvals-panel.component.html',
  styleUrl: './approvals-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ApprovalsPanelViewModel],
})
export class ApprovalsPanelComponent extends BaseComponent<IApprovalsPanel> {
  protected override readonly model = inject(ApprovalsPanelViewModel);
}
