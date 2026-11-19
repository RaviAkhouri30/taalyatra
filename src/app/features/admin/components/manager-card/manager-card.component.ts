import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { formatMoment } from '../../models/editor-dates';
import { type IManager, accessGroups } from '../../models/team-access.model';

/** One manager on Team access (0019): who, what they may do on each page, and their actions. */
@Component({
  selector: 'app-manager-card',
  imports: [ButtonDirective],
  templateUrl: './manager-card.component.html',
  styleUrl: './manager-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagerCardComponent {
  /** The manager shown. */
  public readonly manager = input.required<IManager>();
  /** Whether their removal waits for the owner's answer. */
  public readonly confirming = input(false);
  /** Whether a removal is being saved. */
  public readonly busy = input(false);
  /** The owner asked to change their settings. */
  public readonly editAsked = output();
  /** The owner asked to remove them. */
  public readonly removeAsked = output();
  /** The owner confirmed the removal. */
  public readonly removeConfirmed = output();
  /** The owner changed their mind. */
  public readonly removeCancelled = output();

  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly groups = computed(() => accessGroups(this.manager().role));
  protected readonly added = computed(() => formatMoment(this.manager().role.addedAt));
  protected readonly uploads = computed(() =>
    this.manager().role.uploads ? 'Can upload' : 'Can’t upload',
  );
  protected readonly headingId = computed(() => `mgr-${this.manager().uid}`);
}
