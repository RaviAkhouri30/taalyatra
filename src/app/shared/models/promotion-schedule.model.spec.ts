import { PromotionStatus } from '@shared/enums/promotion-status.enum';
import { PromotionSchedule } from './promotion-schedule.model';

describe('PromotionSchedule', () => {
  /** 18:29:59 UTC is 23:59:59 in Pune (UTC+5:30); one second later it is the next day there. */
  const lastSecondOfNov1InPune = new Date('2026-11-01T18:29:59Z');
  const firstSecondOfNov2InPune = new Date('2026-11-01T18:30:00Z');

  it('should stay live when the stored promotion has no switch or dates', () => {
    expect(new PromotionSchedule({}).status(lastSecondOfNov1InPune)).toBe(PromotionStatus.Live);
  });

  it('should be off when the owner switched it off, whatever the dates', () => {
    const schedule = new PromotionSchedule({ live: false, startsOn: null, endsOn: null });

    expect(schedule.status(lastSecondOfNov1InPune)).toBe(PromotionStatus.Off);
    expect(schedule.isActive(lastSecondOfNov1InPune)).toBe(false);
  });

  it('should be scheduled until its first day starts in Pune', () => {
    const schedule = new PromotionSchedule({ live: true, startsOn: '2026-11-02' });

    expect(schedule.status(lastSecondOfNov1InPune)).toBe(PromotionStatus.Scheduled);
    expect(schedule.status(firstSecondOfNov2InPune)).toBe(PromotionStatus.Live);
  });

  it('should stay live through its last day in Pune and end the moment that day is over', () => {
    const schedule = new PromotionSchedule({ live: true, endsOn: '2026-11-01' });

    expect(schedule.isActive(lastSecondOfNov1InPune)).toBe(true);
    expect(schedule.status(firstSecondOfNov2InPune)).toBe(PromotionStatus.Ended);
  });

  it('should tell the calendar day in Pune', () => {
    expect(PromotionSchedule.siteDay(firstSecondOfNov2InPune)).toBe('2026-11-02');
  });
});
