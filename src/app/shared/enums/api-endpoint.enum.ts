/**
 * Backend paths. Each mirrors a key path in `fake-db.json` and, later, a Firestore document path,
 * so switching backends needs no change in feature services.
 */
export enum ApiEndpoint {
  HomeHero = 'home/hero',
  HomeMarquee = 'home/marquee',
  HomeTrust = 'home/trust',
}
