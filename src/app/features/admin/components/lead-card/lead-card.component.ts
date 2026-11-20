import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { LEAD_STATUSES, type Lead, type LeadStatus, toLeadStatus } from '../../models/lead.model';

/** One lead on the Leads page (0018 V12): who, what they asked for, and its status. */
@Component({
  selector: 'app-lead-card',
  imports: [ButtonDirective],
  templateUrl: './lead-card.component.html',
  styleUrl: './lead-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadCardComponent {
  /** The lead shown. */
  public readonly lead = input.required<Lead>();
  /** Whether its removal waits for the owner's answer. */
  public readonly confirming = input(false);
  /** Whether a removal is being saved. */
  public readonly busy = input(false);
  /** The owner chose a new status. */
  public readonly statusChanged = output<LeadStatus>();
  /** The signed-in account's email, so its own changes read "by you". */
  public readonly viewer = input('');
  /** Whether Remove is offered: the owner's only (0022 D2). */
  public readonly canRemove = input(true);
  /** The owner asked to remove it. */
  public readonly removeAsked = output();
  /** The owner confirmed the removal. */
  public readonly removeConfirmed = output();
  /** The owner changed their mind. */
  public readonly removeCancelled = output();
  protected readonly statusLine = computed(() => this.lead().statusLine(this.viewer()));

  protected readonly statuses = LEAD_STATUSES;
  protected readonly ghost = ButtonVariant.Ghost;

  /** @param select The status list the owner changed. */
  protected changeStatus(select: HTMLSelectElement): void {
    const status = toLeadStatus(select.value);
    if (status) {
      this.statusChanged.emit(status);
    }
  }
}
