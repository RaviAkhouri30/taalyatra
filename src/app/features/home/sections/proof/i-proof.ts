import { type INavLink } from '@shared/interfaces/i-site-link';

/** A headline number, e.g. "150+" sessions delivered. */
export interface IStatDto {
  readonly value: string;
  readonly label: string;
}

/** A client testimonial. */
export interface ITestimonialDto {
  readonly quote: string;
  readonly name: string;
  /** Role and organisation or occasion. */
  readonly detail: string;
  /** Letter shown in the avatar circle. */
  readonly initial: string;
}

/** A client shown in the "Trusted by" row (a placeholder tile until a logo is uploaded). */
export interface IClientDto {
  readonly name: string;
}

/** Proof section as stored in the backend (`home/proof`). */
export interface IProofDto {
  readonly eyebrow: string;
  readonly title: string;
  /** Label of the link to the Achievements page. */
  readonly cta: string;
  readonly stats: readonly IStatDto[];
  readonly testimonials: readonly ITestimonialDto[];
  readonly trustedLabel: string;
  readonly clients: readonly IClientDto[];
  readonly clientsNote: string;
}

/** What the proof section renders: the stored copy plus the achievements link, while it's on. */
export interface IProofView extends IProofDto {
  /** "See achievements", or `null` when the Achievements page is switched off. */
  readonly achievementsPage: INavLink | null;
}
