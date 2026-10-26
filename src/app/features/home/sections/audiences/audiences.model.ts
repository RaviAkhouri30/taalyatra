import { type IconName } from '@shared/enums/icon-name.enum';
import { toIconName } from '@shared/utils/icon-name.util';
import { type IAudienceCardDto, type IAudiencesDto } from './i-audiences';

/** An audience card with a guaranteed-valid icon. */
export class AudienceCardModel {
  public readonly icon: IconName;
  public readonly title: string;
  public readonly text: string;
  public readonly tags: readonly string[];

  public constructor(dto: IAudienceCardDto) {
    this.icon = toIconName(dto.icon);
    this.title = dto.title;
    this.text = dto.text;
    this.tags = dto.tags;
  }
}

/** "Who it's for" section ready for display. */
export class AudiencesModel {
  public readonly eyebrow: string;
  public readonly title: string;
  public readonly lead: string;
  public readonly cards: readonly AudienceCardModel[];

  public constructor(dto: IAudiencesDto) {
    this.eyebrow = dto.eyebrow;
    this.title = dto.title;
    this.lead = dto.lead;
    this.cards = dto.cards.map((card) => new AudienceCardModel(card));
  }
}
