/** A panel an editor card shows among its fields, for what fields alone can't do (0021). */
export enum SectionPanel {
  /** The ready-made and saved themes, as swatches that fill the form. */
  ThemePresets = 'theme-presets',
  /** Each pair of colours with its contrast ratio, updated as they change. */
  ThemeContrast = 'theme-contrast',
  /** Puts today's look back. */
  ThemeReset = 'theme-reset',
  /** Saves the theme under a name, and renames or deletes the saved ones (0027). */
  ThemeSaved = 'theme-saved',
}
