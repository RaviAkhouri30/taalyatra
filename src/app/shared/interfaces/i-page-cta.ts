/** Closing call to action of an inner page, as stored in its `pages/*` document. */
export interface IPageCtaDto {
  readonly title: string;
  readonly text: string;
  /** Label of the main button (the target is decided by the page). */
  readonly primary: string;
  /** Label of the ghost button. */
  readonly secondary: string;
}
