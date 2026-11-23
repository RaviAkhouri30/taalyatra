import { type IFestiveParticle } from '@shared/interfaces/i-festive-particle';

/**
 * Particle layout from the design prototype: forty scattered positions with staggered delays,
 * shared by every festive theme.
 */
export const FESTIVE_PARTICLES: readonly IFestiveParticle[] = [
  { left: 33, top: 43, delay: 0.59 },
  { left: 25, top: 16, delay: 0.88 },
  { left: 72, top: 80, delay: 0.71 },
  { left: 72, top: 82, delay: 1.98 },
  { left: 1, top: 37, delay: 0.09 },
  { left: 64, top: 24, delay: 2.38 },
  { left: 25, top: 66, delay: 2.99 },
  { left: 50, top: 25, delay: 0.99 },
  { left: 16, top: 13, delay: 1.65 },
  { left: 34, top: 70, delay: 1.41 },
  { left: 29, top: 26, delay: 0.22 },
  { left: 26, top: 91, delay: 1.68 },
  { left: 57, top: 78, delay: 2.11 },
  { left: 10, top: 14, delay: 2.52 },
  { left: 91, top: 29, delay: 2.23 },
  { left: 12, top: 14, delay: 1.73 },
  { left: 11, top: 70, delay: 2.92 },
  { left: 35, top: 58, delay: 1.88 },
  { left: 71, top: 17, delay: 1.05 },
  { left: 68, top: 9, delay: 2.48 },
  { left: 52, top: 76, delay: 2.84 },
  { left: 68, top: 33, delay: 0.66 },
  { left: 61, top: 53, delay: 2.21 },
  { left: 50, top: 3, delay: 2.84 },
  { left: 5, top: 8, delay: 1.49 },
  { left: 6, top: 47, delay: 2.28 },
  { left: 56, top: 17, delay: 0.77 },
  { left: 65, top: 74, delay: 2.06 },
  { left: 8, top: 85, delay: 1.41 },
  { left: 89, top: 85, delay: 0.29 },
  { left: 39, top: 69, delay: 0.28 },
  { left: 63, top: 47, delay: 2.77 },
  { left: 97, top: 55, delay: 1.73 },
  { left: 8, top: 63, delay: 0.44 },
  { left: 97, top: 5, delay: 2.1 },
  { left: 31, top: 13, delay: 2.0 },
  { left: 60, top: 16, delay: 2.59 },
  { left: 61, top: 15, delay: 2.65 },
  { left: 18, top: 32, delay: 0.78 },
  { left: 12, top: 22, delay: 0.49 },
];

/**
 * Particle layout around the offer badge (2.16.0): eight positions on the badge's edges, as % of
 * the layer that reaches a little outside it.
 */
export const FESTIVE_BADGE_PARTICLES: readonly IFestiveParticle[] = [
  { left: 4, top: 20, delay: 0.2 },
  { left: 92, top: 15, delay: 0.9 },
  { left: 20, top: 85, delay: 1.4 },
  { left: 80, top: 90, delay: 0.5 },
  { left: 50, top: 0, delay: 1.1 },
  { left: 0, top: 60, delay: 1.7 },
  { left: 100, top: 55, delay: 0.7 },
  { left: 60, top: 100, delay: 1.9 },
];
