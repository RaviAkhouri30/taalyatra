import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { type IBrand } from '@shared/interfaces/i-brand';
import { type INavLink } from '@shared/interfaces/i-site-link';

/**
 * Logo, name and tagline. Rendered as a home link in the header, and as plain content in the
 * footer (where the logo is decorative because the name follows it).
 */
@Component({
  selector: 'app-brand',
  imports: [NgOptimizedImage, NgTemplateOutlet, RouterLink],
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandComponent {
  public readonly brand = input.required<IBrand>();
  /** When set, the brand becomes a link whose accessible name is the link label. */
  public readonly link = input<INavLink | null>(null);
  /** Loads the logo eagerly; set it for the header instance only. */
  public readonly priority = input<boolean>(false);

  /** Logo alt text: meaningful inside a link, empty (decorative) next to the visible name. */
  protected readonly logoAlt = computed(() => (this.link() ? this.brand().logoAlt : ''));
  /** Intrinsic logo size in CSS px (the stylesheet scales it down on phones). */
  protected readonly logoSize = 52;
}
