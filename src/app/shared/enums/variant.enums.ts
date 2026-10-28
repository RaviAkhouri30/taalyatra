/** Footer layouts from the design: compact (inner pages) and full (home page). */
export enum FooterVariant {
  Compact = 'compact',
  Full = 'full',
}

/** Floating offer badge styles: card (inner pages) and pill (home page). */
export enum PromoVariant {
  Card = 'card',
  Pill = 'pill',
}

/** Video card layouts: home teaser (caption below) and Videos page library (category above). */
/** Heading size of a page's closing call to action (design: 52px on Team, 38px elsewhere). */
export enum PageCtaSize {
  Large = 'large',
  Medium = 'medium',
}

export enum VideoCardVariant {
  Teaser = 'teaser',
  Library = 'library',
  /** Large card leading the Videos page: thumbnail beside a heading and the caption. */
  Featured = 'featured',
}
