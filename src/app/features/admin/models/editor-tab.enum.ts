/** The editor's tabs, which are also the route paths under `/admin` (0017 U1: one per site section). */
export enum EditorTab {
  Hero = 'hero',
  Offer = 'offer',
  Audiences = 'audiences',
  Experiences = 'experiences',
  Shows = 'shows',
  DrumCircle = 'drum-circle',
  RhythmGame = 'rhythm-game',
  Videos = 'videos',
  Gallery = 'gallery',
  /** Our philosophy, with the call to action below it (0028). */
  Philosophy = 'philosophy',
  /** Where we play: the cities (0028). */
  Cities = 'cities',
  /** How it works: the steps (0028). */
  How = 'how',
  Team = 'team',
  /** The Instagram posts (0028). */
  Instagram = 'instagram',
  /** Numbers, testimonials and clients (0028; the site's `proof` section). */
  Testimonials = 'testimonials',
  /** The questions and answers (0028). */
  Faq = 'faq',
  ProposalForm = 'proposal-form',
  /** The Achievements page (0028). */
  Achievements = 'achievements',
  Business = 'business',
  /** Each page's title and search description (0028). */
  Seo = 'seo',
  Contact = 'contact',
  Visibility = 'visibility',
  /** The site's colours, background, text and fonts (0021). */
  Theme = 'theme',
}
