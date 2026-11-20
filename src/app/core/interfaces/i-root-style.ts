/** What the page's root element shows (0021, ADR-0019): plain names and values, no theme logic. */
export interface IRootStyle {
  /** CSS variables to set on `<html>`, by name (`--ty-ink`); any other `--ty-` variable is cleared. */
  readonly variables: ReadonlyMap<string, string>;
  /** Stylesheets to load, such as a font pair's; any other this service loaded is removed. */
  readonly stylesheets: readonly string[];
  /** The browser bar's colour (`<meta name="theme-color">`). */
  readonly browserColour: string;
  /** The background to paint before the app loads on this device's next visit; `null` for today's. */
  readonly rememberedBackground: string | null;
}
