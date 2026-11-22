/** Where saved themes are stored, one document each (0027): apart from the site and its drafts. */
export const SAVED_THEMES_COLLECTION = 'savedThemes';

/** A saved theme's id, a random UUID, as `firestore.rules` accepts it. */
export const SAVED_THEME_ID = /^[0-9a-f-]{36}$/;

/** How many themes the page saves (0027 D4); the rules can't count them, so the page does. */
export const SAVED_THEMES_MAX = 20;

/** The longest name a saved theme may have (0027 D4), as the rules check. */
export const SAVED_THEME_NAME_MAX = 40;
