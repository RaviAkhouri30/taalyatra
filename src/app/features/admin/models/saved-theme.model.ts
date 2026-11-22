import { type DocumentFields } from '@core/interfaces/i-document-store';
import { type ThemeColours } from '@shared/constants/theme.constants';
import { ThemeColour } from '@shared/enums/theme-colour.enum';
import { SiteTheme } from '@shared/models/site-theme.model';
import { SAVED_THEME_ID, SAVED_THEME_NAME_MAX } from './saved-theme.constants';
import { THEME_FORM_KEYS, savedThemeValues } from './theme-form';

/** The fields a saved theme keeps (0027 D2): the Theme page's, every one of them. */
const THEME_KEYS: readonly string[] = [
  ...Object.values(ThemeColour),
  ...Object.values(THEME_FORM_KEYS),
];

/** A saved theme's stored document (`savedThemes/{id}`). */
export interface ISavedThemeDto {
  readonly name: string;
  readonly savedAt: string;
  readonly theme: DocumentFields;
}

/**
 * @param value A stored value.
 * @returns It as a map of fields, or `null` when it isn't one.
 */
function fieldsOf(value: unknown): ReadonlyMap<string, unknown> | null {
  return typeof value === 'object' && value !== null ? new Map(Object.entries(value)) : null;
}

/**
 * @param name A theme's name.
 * @returns It as names are compared: trimmed, in lower case, with runs of spaces as one.
 */
export function nameKey(name: string): string {
  return name.trim().replaceAll(/\s+/g, ' ').toLowerCase();
}

/**
 * A theme saved from the Theme page under a name (0027), to pick again later. Its `values` are the
 * form's, so choosing it fills the form as a ready-made theme does.
 */
export class SavedTheme {
  private constructor(
    /** Its document's id. */
    public readonly id: string,
    /** The name it was saved under. */
    public readonly name: string,
    /** When, as an ISO time. */
    public readonly savedAt: string,
    /** Everything on the page, as form values. */
    public readonly values: DocumentFields,
  ) {}

  /** Its six colours, for its swatch. */
  public get colours(): ThemeColours {
    return SiteTheme.from(this.values).choices.colours;
  }

  /**
   * @param id A new document id (a UUID).
   * @param name The name, as typed; it's trimmed.
   * @param savedAt Now, as an ISO time.
   * @param edited The Theme page's form values.
   * @returns The theme to save.
   */
  public static create(
    id: string,
    name: string,
    savedAt: string,
    edited: DocumentFields,
  ): SavedTheme {
    return new SavedTheme(id, name.trim(), savedAt, SavedTheme.known(savedThemeValues(edited)));
  }

  /**
   * @param id The document's id.
   * @param stored The document, read as untrusted.
   * @returns The theme, or `null` when the document isn't one, so a bad one is left out of the list
   *   rather than breaking it.
   */
  public static from(id: string, stored: unknown): SavedTheme | null {
    const fields = fieldsOf(stored);
    const name = fields?.get('name');
    const savedAt = fields?.get('savedAt');
    const theme = fieldsOf(fields?.get('theme'));
    const valid =
      SAVED_THEME_ID.test(id) &&
      typeof name === 'string' &&
      name.trim().length > 0 &&
      name.length <= SAVED_THEME_NAME_MAX &&
      typeof savedAt === 'string';
    return valid && theme
      ? new SavedTheme(id, name, savedAt, SavedTheme.known(Object.fromEntries(theme)))
      : null;
  }

  /** Only the page's fields, and only as text: anything else in a document is ignored. */
  private static known(values: DocumentFields): DocumentFields {
    return Object.fromEntries(
      Object.entries(values).filter(
        ([key, value]) => THEME_KEYS.includes(key) && typeof value === 'string',
      ),
    );
  }

  /**
   * @param edited The Theme page's form values.
   * @returns Whether they are this theme, every field of it.
   */
  public matches(edited: DocumentFields): boolean {
    const values = new Map(Object.entries(savedThemeValues(edited)));
    const own = Object.entries(this.values);
    return own.length > 0 && own.every(([key, value]) => values.get(key) === value);
  }

  /**
   * @param name The new name, as typed.
   * @returns The same theme under it.
   */
  public renamed(name: string): SavedTheme {
    return new SavedTheme(this.id, name.trim(), this.savedAt, this.values);
  }

  /** @returns Its document, as the rules accept it. */
  public toDocument(): ISavedThemeDto {
    return { name: this.name, savedAt: this.savedAt, theme: this.values };
  }
}
