/**
 * Limits for the inner pages' own text, made editable in 2.11.0 (0028): the longest value of each
 * field, and the most items each list holds. Sized from today's content with room to grow. The
 * rules check each page's heading; the lists are held to these by the editor.
 */
export const PAGE_MAX_LENGTH = {
  label: 60,
  cardTitle: 80,
  cardText: 300,
  note: 300,
  statValue: 12,
  statLabel: 40,
  year: 20,
  publication: 80,
  headline: 160,
  url: 500,
  event: 120,
  venue: 120,
} as const;

/** The most items each inner page's list holds (0028). */
export const PAGE_MAX_ITEMS = {
  teamValues: 6,
  setups: 8,
  showSteps: 6,
  stats: 6,
  milestones: 12,
  recognition: 8,
  press: 8,
  performances: 12,
} as const;

/** The longest title and search description of a page (0028), and the lengths Google shows. */
export const SEO_MAX_LENGTH = {
  title: 70,
  titleRecommended: 60,
  description: 200,
  descriptionRecommended: 155,
} as const;
