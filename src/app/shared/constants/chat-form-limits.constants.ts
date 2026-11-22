/**
 * Limits for the chat assistant's script and the proposal form's wording, made editable in 2.12.0
 * (0028): the longest value of each field, and the most items each list holds. Sized from today's
 * content with room to grow. The rules check each section's heading; the rest is held to these by
 * the editor.
 */
export const CHAT_FORM_MAX_LENGTH = {
  label: 80,
  line: 160,
  message: 500,
  keyword: 40,
  /** A proposal's answer may be up to 100 characters (`isValidProposal`), so a choice may too. */
  choice: 100,
} as const;

/** The most items each list holds (0028). */
export const CHAT_FORM_MAX_ITEMS = {
  quickReplies: 6,
  replies: 30,
  keywords: 12,
  assurances: 5,
  choices: 12,
  choiceGroups: 4,
} as const;
