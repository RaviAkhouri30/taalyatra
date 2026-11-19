import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';
import { type IPublishRecord } from '../../models/i-publish-record';
import { type IHistoryEntry } from '../../models/publish-page.model';

/**
 * The publish history on Review & publish, with going back to before any publish (0016 V3). It
 * warns that later publishes are replaced too, and offers a backup first.
 */
@Component({
  selector: 'app-publish-history',
  imports: [ButtonDirective],
  templateUrl: './publish-history.component.html',
  styleUrl: './publish-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishHistoryComponent {
  /** The publishes, newest first. */
  public readonly entries = input.required<readonly IHistoryEntry[]>();
  /** The publish whose go-back is being confirmed. */
  public readonly confirming = input<string | null>(null);
  /** Whether going back is offered: the owner's only (0019 decision 6). */
  public readonly canGoBack = input(true);
  /** Something is running: the confirm buttons wait. */
  public readonly busy = input(false);
  /** The owner pressed "Go back to before this publish". */
  public readonly asked = output<IPublishRecord>();
  /** The owner confirmed going back. */
  public readonly confirmed = output<IPublishRecord>();
  /** The owner changed their mind. */
  public readonly cancelled = output();
  /** The owner wants a backup before going back. */
  public readonly backupRequested = output();

  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly compact = ButtonSize.Compact;
}
