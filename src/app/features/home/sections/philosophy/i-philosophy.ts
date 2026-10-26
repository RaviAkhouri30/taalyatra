/** A titled paragraph (pillar). */
export interface ITitledTextDto {
  readonly title: string;
  readonly text: string;
}

/** A numbered goal. */
export interface IGoalDto extends ITitledTextDto {
  readonly number: string;
}

/** A journey milestone; `when` is a year or "Today". */
export interface IMilestoneDto extends ITitledTextDto {
  readonly when: string;
}

/** A sub-section with an eyebrow, a title and items. */
export interface ITitledListDto<T> {
  readonly eyebrow: string;
  readonly title: string;
  readonly items: readonly T[];
}

/** Philosophy section as stored in the backend (`home/philosophy`). */
export interface IPhilosophyDto {
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly pillars: readonly ITitledTextDto[];
  readonly goals: ITitledListDto<IGoalDto>;
  readonly journey: ITitledListDto<IMilestoneDto>;
}
