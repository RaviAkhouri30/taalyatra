/**
 * The stored `site/theme` document (0021). Every field is optional: a missing one keeps today's
 * look. Read as untrusted: `SiteTheme.from` checks each value.
 */
export interface ISiteThemeDto {
  readonly preset?: string;
  readonly background?: string;
  readonly cards?: string;
  readonly text?: string;
  readonly quietText?: string;
  readonly accent?: string;
  readonly secondAccent?: string;
  readonly backdrop?: string;
  readonly textSize?: string;
  readonly headingWeight?: string;
  readonly fonts?: string;
}
