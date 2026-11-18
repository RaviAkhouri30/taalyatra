import { VISIT_PAGES, type VisitDevice } from '@shared/constants/visit.constants';

/** Signals a browser can send to ask not to be tracked. */
type PrivacyNavigator = Navigator & { readonly globalPrivacyControl?: boolean };

/**
 * Visitors that aren't people, by what they call themselves: search crawlers (`Googlebot/2.1`,
 * `bingbot/2.0`), speed tools (Lighthouse and PageSpeed send `Chrome-Lighthouse`, WebPageTest
 * `PTST`) and headless browsers. `bot/` and not `bot`, so phone makers such as Cubot still count.
 */
const AUTOMATED_AGENT = /bot\/|crawler|spider|slurp|lighthouse|headless|pagespeed|ptst/i;

/** Mirrors `_breakpoints.scss`, so "phone" means what it does in the site's layout. */
const PHONE_MAX_WIDTH = 620;
const TABLET_MAX_WIDTH = 1000;

const COUNTED_PAGES: ReadonlySet<string> = new Set(VISIT_PAGES);

/**
 * Whether this page load may be reported at all, for speed (0012) or as a visit (0018): one of
 * the public pages, from a person whose browser hasn't asked not to be tracked.
 * @param view The browser window.
 * @returns `true` when it may be reported.
 */
export function mayReport(view: Window): boolean {
  const navigator = view.navigator as PrivacyNavigator;
  return (
    COUNTED_PAGES.has(view.location.pathname) &&
    navigator.globalPrivacyControl !== true &&
    navigator.doNotTrack !== '1' &&
    // A browser driven by a script (Playwright, Selenium, Puppeteer) says so here.
    !navigator.webdriver &&
    !AUTOMATED_AGENT.test(navigator.userAgent)
  );
}

/**
 * @param width The window's width, in CSS pixels.
 * @returns The kind of device, by the site's own breakpoints.
 */
export function deviceFor(width: number): VisitDevice {
  if (width <= PHONE_MAX_WIDTH) {
    return 'phone';
  }
  return width <= TABLET_MAX_WIDTH ? 'tablet' : 'desktop';
}
