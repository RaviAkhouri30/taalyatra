/**
 * Backend paths. Each mirrors a key path in `fake-db.json` and, later, a Firestore document path,
 * so switching backends needs no change in feature services.
 */
export enum ApiEndpoint {
  HomeHero = 'home/hero',
  HomeMarquee = 'home/marquee',
  HomeTrust = 'home/trust',
  HomeOffer = 'home/offer',
  HomeAudiences = 'home/audiences',
  HomeExperiences = 'home/experiences',
  HomeShows = 'home/shows',
  HomeDrumCircle = 'home/drumCircle',
  HomeRhythmGame = 'home/rhythmGame',
  HomeVideos = 'home/videos',
  Videos = 'videos',
  HomeGallery = 'home/gallery',
  Gallery = 'gallery',
  HomePhilosophy = 'home/philosophy',
  HomeMidCta = 'home/midCta',
  HomeCities = 'home/cities',
  HomeHow = 'home/how',
  HomeTeam = 'home/team',
  Team = 'team',
  HomeInstagram = 'home/instagram',
  HomeProof = 'home/proof',
  HomeFaq = 'home/faq',
  HomeContact = 'home/contact',
  HomeAssistant = 'home/assistant',
  /** Site-wide content: brand, contact details, social links, promotion. */
  SiteConfig = 'site/config',
  /** Proposal requests from the contact form (create-only collection). */
  Proposals = 'proposals',
}
