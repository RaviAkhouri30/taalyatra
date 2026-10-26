import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type IStep } from '@shared/interfaces/i-step';

/** A row of numbered process steps (four across on desktop, two on tablets, stacked on phones). */
@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrl: './steps.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepsComponent {
  public readonly steps = input.required<readonly IStep[]>();
}
