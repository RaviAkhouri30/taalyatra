import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type IDayTotal } from '../../models/visits-page.model';
import { shortDay } from '../../models/site-days';

/** The chart's drawing size, in its own units. */
const WIDTH = 140;
const HEIGHT = 36;
const GAP = 4;
/** A day nobody came still shows a sliver, so the days read as seven. */
const MIN_BAR = 2;

/** One bar's place in the drawing. */
interface IBar {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * A week of visits as seven small bars (0030), for the dashboard's Visits card. Screen readers get
 * the numbers in words.
 */
@Component({
  selector: 'app-mini-bars',
  templateUrl: './mini-bars.component.html',
  styleUrl: './mini-bars.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'img', '[attr.aria-label]': 'label()' },
})
export class MiniBarsComponent {
  /** The days, oldest first. */
  public readonly days = input.required<readonly IDayTotal[]>();

  protected readonly viewBox = `0 0 ${String(WIDTH)} ${String(HEIGHT)}`;
  protected readonly bars = computed<IBar[]>(() => {
    const days = this.days();
    const most = Math.max(1, ...days.map((day) => day.total));
    const width = (WIDTH - GAP * (days.length - 1)) / Math.max(days.length, 1);
    return days.map((day, index) => {
      const height = Math.max(MIN_BAR, (day.total / most) * HEIGHT);
      return { x: index * (width + GAP), y: HEIGHT - height, width, height };
    });
  });
  protected readonly label = computed(
    () =>
      `Visits, last 7 days: ${this.days()
        .map((day) => `${shortDay(day.day)} ${String(day.total)}`)
        .join(', ')}`,
  );
}
