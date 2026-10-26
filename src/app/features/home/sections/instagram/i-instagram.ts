import { type IImage } from '@shared/interfaces/i-image';

/** An Instagram post shown in the grid. */
export interface IInstagramPostDto {
  /** Thumbnail; decorative (the card link and caption describe the post). */
  readonly image: IImage;
  readonly caption: string;
  readonly url: string;
}

/** Instagram section as stored in the backend (`home/instagram`). */
export interface IInstagramDto {
  readonly eyebrow: string;
  readonly title: string;
  readonly followLabel: string;
  readonly profileUrl: string;
  /** Accessible name of each post link. */
  readonly postLabel: string;
  readonly posts: readonly IInstagramPostDto[];
}
