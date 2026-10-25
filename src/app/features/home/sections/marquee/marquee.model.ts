/** Scrolling strip of experience names. */
export class MarqueeModel {
  /** Items drawn twice in a row: the strip scrolls by half its width, so the loop is seamless. */
  public readonly track: readonly string[];

  public constructor(public readonly items: readonly string[]) {
    this.track = [...items, ...items];
  }
}
