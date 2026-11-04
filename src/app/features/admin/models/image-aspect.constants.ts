/** Each slot's width divided by its height on the site, which its crop frame keeps to (D14). */
export const IMAGE_ASPECT = {
  /** 1:1 */
  team: 1,
  /** 4:3 */
  gallery: 1.333_333,
  /** 16:10 */
  shows: 1.6,
  /** 16:9 */
  videos: 1.777_778,
} as const;
