import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { LinkKind } from '@shared/enums/link-kind.enum';
import { PageCtaSize } from '@shared/enums/variant.enums';
import { type SiteLink } from '@shared/interfaces/i-site-link';

/**
 * A page's call to action: an optional centred heading and line, then a solid and a ghost button.
 * Without a heading it is just the button row, aligned with the content above it.
 */
@Component({
  selector: 'app-page-cta',
  imports: [ButtonDirective, RouterLink],
  templateUrl: './page-cta.component.html',
  styleUrl: './page-cta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.centered]': 'heading() !== ""',
    '[class.medium]': 'size() === sizes.Medium',
  },
})
export class PageCtaComponent {
  /** Heading; empty for a plain button row. */
  public readonly heading = input('');
  /** Line under the heading. */
  public readonly text = input('');
  /** Solid button. */
  public readonly primary = input.required<SiteLink>();
  /** Ghost button; `null` for a single button. */
  public readonly secondary = input<SiteLink | null>(null);
  public readonly size = input<PageCtaSize>(PageCtaSize.Large);

  protected readonly links = computed(() =>
    [this.primary(), this.secondary()].filter((link): link is SiteLink => link !== null),
  );
  protected readonly linkKind = LinkKind;
  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly solid = ButtonVariant.Primary;
  protected readonly sizes = PageCtaSize;
}
