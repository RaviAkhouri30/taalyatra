import { type IsActiveMatchOptions } from '@angular/router';

/**
 * Active-link matching for navigation: a link is current only when its path AND fragment match,
 * so "/#experiences" is not marked current on "/shows".
 */
export const NAV_ACTIVE_OPTIONS: IsActiveMatchOptions = {
  paths: 'exact',
  fragment: 'exact',
  queryParams: 'ignored',
  matrixParams: 'ignored',
};
