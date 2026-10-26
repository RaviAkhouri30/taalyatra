import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Section heading with an action on the right (design `.ighead`): eyebrow and title on one side,
 * projected buttons or links on the other, wrapping on narrow screens.
 *
 * @example
 * <app-section-header eyebrow="Gallery" title="Moments from the circle.">
 *   <a appButton …>See all</a>
 * </app-section-header>
 */
@Component({
  selector: 'app-section-header',
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeaderComponent {
  public readonly eyebrow = input<string>('');
  public readonly title = input.required<string>();
}
