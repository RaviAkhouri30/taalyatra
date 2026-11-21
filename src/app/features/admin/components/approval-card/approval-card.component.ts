import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';
import { requiredTrimmedValidator } from '../../forms/auth.validators';
import { APPROVAL_NOTE_MAX, ApprovalStatus } from '../../models/approval.model';
import { type IApprovalView } from '../../models/approvals-panel.model';

/**
 * One approval request (0019): for the owner, with Approve and Send back; for the manager who sent
 * it, where it stands, with Withdraw or Clear.
 */
@Component({
  selector: 'app-approval-card',
  imports: [ButtonDirective, ReactiveFormsModule],
  templateUrl: './approval-card.component.html',
  styleUrl: './approval-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApprovalCardComponent {
  /** The request shown. */
  public readonly view = input.required<IApprovalView>();
  /** Shown to the owner, who answers it, rather than to the manager who sent it. */
  public readonly owner = input(false);
  /** Whether an answer is being saved. */
  public readonly busy = input(false);
  /** Whether the manager approves their own changes (0023 D4). */
  public readonly canApproveOwn = input(false);
  /** The owner approved it. */
  public readonly approved = output();
  /** The owner sent it back, with this reason. */
  public readonly sentBack = output<string>();
  /** The manager took it back. */
  public readonly withdrawn = output();
  /** A manager who can approve takes their waiting request back to approve it themselves (0023 D4). */
  public readonly approvedOwn = output();
  /** The manager cleared an answered request. */
  public readonly dismissed = output();

  /** The owner is writing a reason to send it back. */
  protected readonly askingReason = signal(false);
  protected readonly reason = new FormControl('', {
    nonNullable: true,
    validators: [requiredTrimmedValidator, Validators.maxLength(APPROVAL_NOTE_MAX)],
  });
  protected readonly reasonMax = APPROVAL_NOTE_MAX;
  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly compact = ButtonSize.Compact;
  protected readonly headingId = computed(() => `ap-${this.view().approval.id}`);
  protected readonly waiting = computed(
    () => this.view().approval.status === ApprovalStatus.Waiting,
  );
  /** Where it stands, for the manager. */
  protected readonly statusText = computed(() => {
    const { approval, answeredAt } = this.view();
    if (approval.status === ApprovalStatus.Waiting) {
      return 'Waiting for the owner. You can’t change these pages until they answer.';
    }
    // Who answered, when it's known: the owner, or a super manager for them (0024 D6).
    const by = approval.answeredBy === undefined ? '' : ` by ${approval.answeredBy}`;
    return approval.status === ApprovalStatus.Approved
      ? `Approved and published${by}, ${answeredAt}.`
      : `Sent back${by}, ${answeredAt}. You can carry on editing.`;
  });
  protected readonly problemsText = computed(() => {
    const count = this.view().problems;
    return `${String(count)} ${count === 1 ? 'problem' : 'problems'} to fix before approving. Fix them on the page: your edits become part of what you publish.`;
  });

  protected askReason(): void {
    this.reason.reset();
    this.askingReason.set(true);
  }

  protected cancelReason(): void {
    this.askingReason.set(false);
  }

  protected sendBack(): void {
    this.reason.markAsTouched();
    if (this.reason.valid) {
      this.sentBack.emit(this.reason.value.trim());
    }
  }
}
