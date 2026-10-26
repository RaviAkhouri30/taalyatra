/** Position (as % of the container) and animation delay of one festive particle. */
export interface IFestiveParticle {
  readonly left: number;
  readonly top: number;
  /** Seconds before the particle's first animation cycle. */
  readonly delay: number;
}
