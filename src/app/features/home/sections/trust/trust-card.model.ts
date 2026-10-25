import { type IconName } from '@shared/enums/icon-name.enum';
import { toIconName } from '@shared/utils/icon-name.util';
import { type ITrustCardDto } from './i-trust-card';

/** A reassurance card with a guaranteed-valid icon. */
export class TrustCardModel {
  public readonly icon: IconName;
  public readonly title: string;
  public readonly text: string;

  public constructor(dto: ITrustCardDto) {
    this.icon = toIconName(dto.icon);
    this.title = dto.title;
    this.text = dto.text;
  }
}
