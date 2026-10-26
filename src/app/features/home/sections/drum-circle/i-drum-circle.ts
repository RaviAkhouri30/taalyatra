import { type IImage } from '@shared/interfaces/i-image';

/** A labelled fact in the spec strip, e.g. Duration → "45 to 60 mins". */
export interface ISpecDto {
  readonly label: string;
  readonly value: string;
}

/** One step of the session flow. */
export interface IFlowStepDto {
  readonly title: string;
  readonly minutes: number;
}

/** Drum Circle details as stored in the backend (`home/drumCircle`). */
export interface IDrumCircleDto {
  readonly eyebrow: string;
  readonly title: string;
  readonly specs: readonly ISpecDto[];
  readonly aboutTitle: string;
  /** About paragraphs, in order. */
  readonly about: readonly string[];
  readonly objectivesTitle: string;
  readonly objectives: readonly string[];
  readonly occasionsTitle: string;
  readonly occasions: readonly string[];
  readonly cta: string;
  readonly gallery: readonly IImage[];
  readonly relatedTitle: string;
  /** Names of similar experiences; each links to the experiences section. */
  readonly related: readonly string[];
  readonly flowTitle: string;
  /** Unit printed after each step's minutes, e.g. "min". */
  readonly flowUnit: string;
  readonly flow: readonly IFlowStepDto[];
}
