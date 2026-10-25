import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { type INavLink } from '@shared/interfaces/i-site-link';

/**
 * Full-width menu shown under the header at tablet width and below when `open`.
 * The last link is styled as the call to action.
 */
@Component({
  selector: 'app-mobile-nav',
  imports: [RouterLink],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileNavComponent {
  public readonly links = input.required<readonly INavLink[]>();
  public readonly open = input<boolean>(false);
  /** DOM id, referenced by the menu toggle's `aria-controls`. */
  public readonly navId = input.required<string>();
  /** Emits when a link is chosen, so the owner can close the menu. */
  public readonly navigate = output();
}
