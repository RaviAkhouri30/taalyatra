import { type IHideable } from '@shared/interfaces/i-hideable';
/** A question and its answer; `open` shows it expanded on load. */
export interface IFaqItemDto extends IHideable {
  readonly question: string;
  readonly answer: string;
  readonly open: boolean;
}

/** FAQ section as stored in the backend (`home/faq`). */
export interface IFaqDto {
  readonly eyebrow: string;
  readonly title: string;
  readonly items: readonly IFaqItemDto[];
}
