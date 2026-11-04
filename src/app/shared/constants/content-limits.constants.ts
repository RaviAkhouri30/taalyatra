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
  imageSrc: 500,
  imageAlt: 300,
  mediaName: 200,
  memberName: 80,
  memberRole: 80,
  memberBio: 400,
  memberFunFact: 200,
  memberSkills: 12,
  showIcon: 40,
  showTitle: 80,
  showText: 400,
  showEnsemble: 80,
  showSetLength: 40,
  showBestFor: 120,
  showCta: 40,
  videoTitle: 120,
  videoCategory: 40,
  videoCaption: 200,
  videoDuration: 12,
  videoUrl: 500,
  experienceName: 80,
  experienceTag: 60,
  experienceCategory: 40,
  experienceDescription: 400,
  experienceDetail: 40,
} as const;

/**
 * The most items each collection may hold, which keeps its draft and history records small (D16).
 * `firestore.rules` enforces the same limits through the numbered document ids.
 */
export const COLLECTION_MAX_ITEMS = {
  gallery: 60,
  team: 24,
  showFormats: 20,
  videos: 60,
} as const;

/** The most experiences the editor offers. They live in one document, not a collection. */
export const EXPERIENCES_MAX_ITEMS = 12;

/**
 * Home documents the editor may change. `firestore.rules` lists the same documents.
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
  'gallery',
  'shows',
];
