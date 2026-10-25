import { IconName } from '@shared/enums/icon-name.enum';
import { isIconName, toIconName } from './icon-name.util';

describe('icon name utils', () => {
  it('should recognise registered icon names', () => {
    expect(isIconName('djembe')).toBe(true);
    expect(isIconName('unicorn')).toBe(false);
  });

  it('should map unknown names to the fallback', () => {
    expect(toIconName('group')).toBe(IconName.Group);
    expect(toIconName('unicorn')).toBe(IconName.Sparkle);
    expect(toIconName('unicorn', IconName.Home)).toBe(IconName.Home);
  });
});
