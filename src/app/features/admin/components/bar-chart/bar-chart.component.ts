import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type IChart } from '../../models/chart';

/** Each bar's slot in the drawing's own units; the drawing stretches to the card's width. */
const SLOT = 10;
const BAR_WIDTH = 8;
/** The gap each side of a bar (half of SLOT less BAR_WIDTH), so bars sit centred in their slots. */
const BAR_INSET = 1;
const HEIGHT = 100;
/** Room left above the tallest bar. */
const TALLEST = 96;
/** A bar with any visits is at least this tall, so it never vanishes next to a big one. */
const SHORTEST = 2;
/** At most this many labels under the bars, so they never run into each other on a phone. */
const MAX_LABELS = 6;

/** One bar as drawn. */
interface IShape {
  readonly key: string;
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly counted: boolean;
  /** Its label, or empty when there isn't room for every one. */
  readonly label: string;
  /** What hovering it says, e.g. "18 Nov 2026: 12". */
  readonly tip: string;
  /** Its number in the table. */
  readonly shown: string;
  readonly title: string;
}

/**
 * A bar graph drawn by the page itself (0018 V11): no chart library to download. The drawing is
 * for sight; the same numbers are in a table under it, for screen readers, keyboards and phones.
 */
@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent {
  /** The graph to draw. */
  public readonly chart = input.required<IChart>();
  /** Its heading, e.g. "Visits". */
  public readonly caption = input.required<string>();
  /** A unique id for the heading, which names the figure. */
  public readonly headingId = input.required<string>();

  protected readonly barWidth = BAR_WIDTH;
  protected readonly viewBox = computed(
    () => `0 0 ${String(this.chart().bars.length * SLOT)} ${String(HEIGHT)}`,
  );
  protected readonly shapes = computed<readonly IShape[]>(() => {
    const { bars, max } = this.chart();
    const every = Math.ceil(bars.length / MAX_LABELS);
    return bars.map((bar, index) => {
      const height =
        bar.value === null || bar.value === 0 ? 0 : Math.max(SHORTEST, (bar.value / max) * TALLEST);
      const shown = bar.value === null ? 'Not counted yet' : bar.value.toLocaleString('en-IN');
      return {
        key: bar.key,
        x: index * SLOT + BAR_INSET,
        y: HEIGHT - height,
        height,
        counted: bar.value !== null,
        // Counted from the newest bar back, so the latest period always has its label.
        label: (bars.length - 1 - index) % every === 0 ? bar.label : '',
        tip: `${bar.title}: ${shown}`,
        shown,
        title: bar.title,
      };
    });
  });
}
