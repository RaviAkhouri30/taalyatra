import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HeroLeadGap } from '@shared/enums/hero-lead-gap.enum';

/**
 * Inner-page hero: eyebrow, title with an accent-coloured ending, lead paragraph, then any
 * projected content (call-to-action buttons, filter chips…).
 *
 * @example
 * <app-page-hero eyebrow="Our team" title="The people behind" highlight="the beat." lead="…">
 *   <div class="actions">…</div>
 * </app-page-hero>
 */
@Component({
  selector: 'app-page-hero',
  templateUrl: './page-hero.component.html',
  styleUrl: './page-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeroComponent {
  public readonly eyebrow = input.required<string>();
  public readonly title = input.required<string>();
  /** Accent-coloured words appended to the title. */
  public readonly highlight = input<string>('');
  public readonly lead = input<string>('');
  public readonly leadGap = input<HeroLeadGap>(HeroLeadGap.Regular);

  protected readonly isRelaxed = computed(() => this.leadGap() === HeroLeadGap.Relaxed);
}
