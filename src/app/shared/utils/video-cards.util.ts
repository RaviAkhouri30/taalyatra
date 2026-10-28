import { type IVideoCard, type IVideoDto } from '@shared/interfaces/i-video';
import { formatTemplate } from './format-template.util';

/**
 * Pairs each video with its accessible name, the same way on every page.
 * @param videos Videos to show.
 * @param watchLabel Name template with `{title}` (`site/config.labels.watchVideo`); when empty,
 *   the video's title names the card.
 * @returns One card per video, in order.
 */
export function toVideoCards(
  videos: readonly IVideoDto[],
  watchLabel: string,
): readonly IVideoCard[] {
  return videos.map((video) => ({
    video,
    ariaLabel: watchLabel ? formatTemplate(watchLabel, { title: video.title }) : video.title,
  }));
}
