import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type ISiteCredit } from '@shared/interfaces/i-site-config';

/** "Developed with love by …" line in the footer's bottom bar (text from `site/config`). */
@Component({
  selector: 'app-footer-credit',
  templateUrl: './footer-credit.component.html',
  styleUrl: './footer-credit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterCreditComponent {
  /** Label, developer name and profile link. */
  public readonly credit = input.required<ISiteCredit>();
}
