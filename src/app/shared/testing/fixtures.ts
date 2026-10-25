import { LAYOUT_CHROME } from '@shared/constants/navigation.constants';
import { DEFAULT_SITE_CONFIG } from '@shared/constants/site.constants';
import { PageLayout } from '@shared/enums/page-layout.enum';

/** Test fixtures shared by specs (excluded from coverage). */
export const SITE = DEFAULT_SITE_CONFIG;
export const HOME_CHROME = LAYOUT_CHROME[PageLayout.Home]!;
export const PAGE_CHROME = LAYOUT_CHROME[PageLayout.Page]!;

/** @returns All elements matching `selector` under `root`. */
export function queryAll(root: HTMLElement, selector: string): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector));
}

/** @returns Trimmed text of each element matching `selector`. */
export function texts(root: HTMLElement, selector: string): string[] {
  return queryAll(root, selector).map((element) => element.textContent.trim());
}
