import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { type IconName } from '@shared/enums/icon-name.enum';
import { DashTone } from '../../models/dash-tone.enum';

/**
 * One dashboard card (0030): a coloured icon and tint for what it's about, its heading and an
 * optional badge, the content (projected), and where to go next.
 */
@Component({
  selector: 'app-dash-card',
  imports: [IconComponent, RouterLink],
  templateUrl: './dash-card.component.html',
  styleUrl: './dash-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "'dc--' + tone()",
    '[class.dc--urgent]': 'urgent()',
  },
})
export class DashCardComponent {
  /** What it's about, which sets its colour. */
  public readonly tone = input(DashTone.Quiet);
  public readonly icon = input.required<IconName>();
  public readonly heading = input.required<string>();
  /** The heading's id, which names the card. */
  public readonly headingId = input.required<string>();
  /** A short word beside the heading, e.g. "2 new"; none when empty. */
  public readonly badge = input('');
  /** It asks for something: marked more strongly, in Needs you. */
  public readonly urgent = input(false);
  /** Where its link goes, and what it says. */
  public readonly link = input.required<string>();
  public readonly linkText = input.required<string>();
  /** A part of that page to open at, if any. */
  public readonly fragment = input<string | undefined>(undefined);
}
