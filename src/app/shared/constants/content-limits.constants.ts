/**
 * Longest value each field the admin edits accepts. `firestore.rules` enforces the same limits,
 * and the rules tests build their payloads from this constant, so the editor and the server
 * can't drift apart.
 */
export const CONTENT_MAX_LENGTH = {
  eyebrow: 60,
  title: 120,
  highlight: 80,
  lead: 600,
  brandName: 60,
  tagline: 60,
  phoneDisplay: 20,
  phoneE164: 16,
  email: 254,
  address: 300,
  promotionLabel: 40,
} as const;

/**
 * Home documents the editor may change in 1.6.0. `firestore.rules` lists the same documents.
 */
export const EDITABLE_HOME_SECTIONS: readonly string[] = [
  'hero',
  'offer',
  'audiences',
  'experiences',
  'rhythmGame',
  'videos',
  'team',
  'contact',
];
