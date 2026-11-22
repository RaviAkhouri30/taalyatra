import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The default size of the sparkle, in pixels. */
const DEFAULT_SPARK_SIZE = 16;

/**
 * The AI help's mark (0029): a four-point sparkle with two small ones, as in the approved
 * prototype. The admin's own, so the public site's icon set doesn't grow. Decoration only.
 */
@Component({
  selector: 'app-ai-spark',
  templateUrl: './ai-spark.component.html',
  styleUrl: './ai-spark.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class AiSparkComponent {
  /** Width and height, in pixels. */
  public readonly size = input(DEFAULT_SPARK_SIZE);
}
