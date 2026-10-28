/** Hero copy of an inner page, as stored in its `pages/*` document. */
export interface IPageHeroDto {
  readonly eyebrow: string;
  readonly title: string;
  /** Accent-coloured end of the title. */
  readonly highlight: string;
  readonly lead: string;
}
