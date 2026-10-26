/** One numbered step of a process (home "How it works", Shows "How a show comes together"). */
export interface IStep {
  /** Display number, e.g. "01". */
  readonly number: string;
  readonly title: string;
  readonly text: string;
}
