/**
 * Which site chrome a route renders, set as route data (`ROUTE_DATA_KEYS.Layout`).
 * - `Home`: home-page header/nav, full footer, pill promo.
 * - `Page`: inner-page header/nav, compact footer, card promo, WhatsApp button.
 * - `Bare`: no public chrome (admin area).
 */
export enum PageLayout {
  Home = 'home',
  Page = 'page',
  Bare = 'bare',
}
