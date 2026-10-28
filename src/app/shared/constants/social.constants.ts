import { IconName } from '@shared/enums/icon-name.enum';
import { SocialPlatform } from '@shared/enums/social-platform.enum';

/** Icon shown for each social network. */
export const SOCIAL_ICONS: ReadonlyMap<SocialPlatform, IconName> = new Map([
  [SocialPlatform.WhatsApp, IconName.WhatsApp],
  [SocialPlatform.Instagram, IconName.Instagram],
  [SocialPlatform.YouTube, IconName.YouTube],
  [SocialPlatform.Facebook, IconName.Facebook],
]);
