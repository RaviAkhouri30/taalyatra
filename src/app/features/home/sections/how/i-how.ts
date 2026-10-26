import { type IStep } from '@shared/interfaces/i-step';

/** "How it works" as stored in the backend (`home/how`). */
export interface IHowDto {
  readonly eyebrow: string;
  readonly title: string;
  readonly steps: readonly IStep[];
}
