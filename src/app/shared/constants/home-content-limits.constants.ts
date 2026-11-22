/**
 * Limits for the home sections made editable in 2.10.0 (0028): the longest value of each field,
 * and the most items each list holds. Sized from today's content with room to grow. The rules
 * check each section's heading; the lists are held to these by the editor.
 */
export const HOME_MAX_LENGTH = {
  word: 40,
  cardTitle: 80,
  cardText: 300,
  tag: 40,
  number: 6,
  when: 20,
  city: 40,
  label: 60,
  url: 500,
  caption: 200,
  quote: 500,
  name: 80,
  detail: 120,
  initial: 2,
  statValue: 12,
  statLabel: 40,
  clientName: 60,
  note: 200,
  question: 160,
  answer: 800,
} as const;

/** The most items each home list holds (0028). */
export const HOME_MAX_ITEMS = {
  marquee: 12,
  trust: 4,
  audiences: 6,
  audienceTags: 6,
  pillars: 4,
  goals: 6,
  journey: 8,
  cities: 12,
  steps: 6,
  posts: 8,
  stats: 4,
  testimonials: 6,
  clients: 12,
  faq: 12,
} as const;
