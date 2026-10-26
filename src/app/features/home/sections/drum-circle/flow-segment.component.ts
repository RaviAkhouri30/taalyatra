import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type IFlowStep } from './drum-circle.model';

/**
 * One step of the session flow. Its width grows with its minutes (`flex-grow` = minutes), so the
 * bar reads as a timeline; set as a host binding because templates may not carry inline styles.
 */
@Component({
  selector: 'app-flow-segment',
  templateUrl: './flow-segment.component.html',
  styleUrl: './flow-segment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'seg',
    '[class.o]': 'highlighted()',
    '[style.flex]': 'step().minutes',
  },
})
export class FlowSegmentComponent {
  public readonly step = input.required<IFlowStep>();
  /** Alternate steps are drawn in the accent colour. */
  public readonly highlighted = input<boolean>(false);
}
