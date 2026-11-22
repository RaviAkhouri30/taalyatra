/** Each slot's width divided by its height on the site, which its crop frame keeps to (D14). */
export const IMAGE_ASPECT = {
  /** 1:1 */
  team: 1,
  /** 4:3 */
  gallery: 1.333_333,
  /** 16:10 */
  shows: 1.6,
  /** 16:10 */
  experiences: 1.6,
  /** 4:5 portrait: one picture beside the About text (0015 V16). */
  drumCircle: 0.8,
  /** 16:9 */
  videos: 1.777_778,
  instagram: 1,
} as const;
