/** Team teaser heading as stored in the backend (`home/team`). */
export interface IHomeTeamDto {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  /** Label of the link to the Team page. */
  readonly cta: string;
  /** How many members to show. */
  readonly count: number;
}
