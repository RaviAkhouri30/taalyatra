/**
 * An item the owner can take off the site without deleting it (0028 D4, 2.15.0). Missing means
 * shown, so items stored before 2.15.0 need nothing.
 */
export interface IHideable {
  readonly hidden?: boolean;
}
