import { type IImage } from './i-image';

/** A video as stored in the backend (`videos`), shared by the home teaser and the Videos page. */
export interface IVideoDto {
  readonly title: string;
  /** Filter category on the Videos page. */
  readonly category: string;
  /** Short line under the title in the home teaser. */
  readonly caption: string;
  /** Thumbnail; decorative (the card link names the video). */
  readonly image: IImage;
  /** Running time label, e.g. "3:42". */
  readonly duration: string;
  /** Where the video plays (YouTube). */
  readonly url: string;
}

/** A video ready for a card: the video plus its accessible name. */
export interface IVideoCard {
  readonly video: IVideoDto;
  readonly ariaLabel: string;
}
