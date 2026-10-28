/**
 * A show format as stored in `showFormats` (ADR-0011): one source for the home teaser (icon,
 * title, text) and the Shows page (plus the specs).
 */
export interface IShowFormatDto {
  /** Name of a registered icon; unknown names fall back to a default icon. */
  readonly icon: string;
  readonly title: string;
  readonly text: string;
  /** Players in the ensemble, e.g. "6–8 players". */
  readonly ensemble: string;
  /** Length of the set, e.g. "60–90 min". */
  readonly setLength: string;
  /** Occasions it suits. */
  readonly bestFor: string;
}
