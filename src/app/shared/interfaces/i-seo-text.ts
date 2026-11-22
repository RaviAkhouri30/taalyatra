import { type SeoPage } from '@shared/enums/seo-page.enum';

/** A page's title and search description. An empty one keeps the page's default (`PAGE_META`). */
export interface ISeoText {
  readonly title: string;
  readonly description: string;
}

/** The stored titles and descriptions, by page (`site/config.seo`); a missing page keeps its default. */
export type SeoTexts = Readonly<Partial<Record<SeoPage, Partial<ISeoText>>>>;
