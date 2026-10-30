import { SITE_TIME_ZONE } from '@shared/constants/time.constants';
import { PromotionStatus } from '@shared/enums/promotion-status.enum';
import { type IPromotionDto } from '@shared/interfaces/i-site-config';

/** `en-CA` formats a date as YYYY-MM-DD, the stored format, so dates compare as strings. */
const SITE_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: SITE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * Decides whether a promotion is shown, from its switch and its optional first and last days
 * (inclusive, in the business's time zone). Older data without these fields stays live.
 */
export class PromotionSchedule {
  private readonly live: boolean;
  private readonly startsOn: string | null;
  private readonly endsOn: string | null;

  /** @param dto The stored promotion. */
  public constructor(dto: Pick<IPromotionDto, 'live' | 'startsOn' | 'endsOn'>) {
    this.live = dto.live !== false;
    this.startsOn = dto.startsOn ?? null;
    this.endsOn = dto.endsOn ?? null;
  }

  /**
   * @param now The current time.
   * @returns The calendar day in the business's time zone, as YYYY-MM-DD.
   */
  public static siteDay(now: Date): string {
    return SITE_DAY.format(now);
  }

  /**
   * @param now The current time.
   * @returns Where the promotion stands today.
   */
  public status(now: Date): PromotionStatus {
    if (!this.live) {
      return PromotionStatus.Off;
    }
    const today = PromotionSchedule.siteDay(now);
    if (this.startsOn !== null && today < this.startsOn) {
      return PromotionStatus.Scheduled;
    }
    if (this.endsOn !== null && today > this.endsOn) {
      return PromotionStatus.Ended;
    }
    return PromotionStatus.Live;
  }

  /**
   * @param now The current time.
   * @returns Whether visitors see the promotion today.
   */
  public isActive(now: Date): boolean {
    return this.status(now) === PromotionStatus.Live;
  }
}
