import { type IImage } from './i-image';

/** A team member as stored in the backend (`team`); edited from the admin "Team" tab. */
export interface ITeamMemberDto {
  readonly name: string;
  readonly role: string;
  readonly bio: string;
  readonly skills: readonly string[];
  readonly funFact: string;
  readonly photo: IImage;
}
