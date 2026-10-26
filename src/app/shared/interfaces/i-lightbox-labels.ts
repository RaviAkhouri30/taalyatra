/** Editable copy of the photo viewer. */
export interface ILightboxLabels {
  /** Accessible name of the dialog. */
  readonly label: string;
  readonly close: string;
  readonly previous: string;
  readonly next: string;
  /** Caption with `{alt}`, `{index}` and `{total}`, e.g. "Hands on a drum · 2 of 7". */
  readonly caption: string;
}
