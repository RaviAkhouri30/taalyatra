import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { VideoCardVariant } from '@shared/enums/variant.enums';
import { type IVideoDto } from '@shared/interfaces/i-video';

/**
 * A video thumbnail card linking to the video (home teaser and Videos page). The whole card is
 * one link whose accessible name comes from `ariaLabel`.
 */
@Component({
  selector: 'app-video-card',
  imports: [NgOptimizedImage],
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.library]': 'isLibrary()', '[class.featured]': 'isFeatured()' },
})
export class VideoCardComponent {
  public readonly video = input.required<IVideoDto>();
  /** Accessible name of the card link, e.g. "Watch Drum day on YouTube". */
  public readonly ariaLabel = input.required<string>();
  public readonly variant = input<VideoCardVariant>(VideoCardVariant.Teaser);
  /** Line above the featured card's heading, e.g. "Featured · Corporate". */
  public readonly eyebrow = input('');
  /** Load the thumbnail eagerly: set for the page's largest image (LCP). */
  public readonly priority = input(false);

  protected readonly isLibrary = computed(() => this.variant() === VideoCardVariant.Library);
  protected readonly isFeatured = computed(() => this.variant() === VideoCardVariant.Featured);
}
