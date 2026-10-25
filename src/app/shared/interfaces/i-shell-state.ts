import { type PageLayout } from '@shared/enums/page-layout.enum';
import { type ISiteConfig } from './i-site-config';

/** Site shell view state: which chrome to draw and the content to draw it with. */
export interface IShellState {
  readonly layout: PageLayout;
  readonly site: ISiteConfig;
}
