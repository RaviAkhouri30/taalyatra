import { type IconName } from '@shared/enums/icon-name.enum';
import { type SocialPlatform } from '@shared/enums/social-platform.enum';

/** A social network profile shown as an icon button. */
export interface ISocialLink {
  readonly platform: SocialPlatform;
  readonly label: string;
  readonly href: string;
  readonly icon: IconName;
}
