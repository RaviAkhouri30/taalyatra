import { type PageLayout } from '@shared/enums/page-layout.enum';
import { type SiteVisibility } from '@shared/models/site-visibility.model';
import { type ISiteConfig } from './i-site-config';

/** Site shell view state: which chrome to draw, the content to draw it with, and what is on. */
export interface IShellState {
  readonly layout: PageLayout;
  readonly site: ISiteConfig;
  readonly visibility: SiteVisibility;
}
