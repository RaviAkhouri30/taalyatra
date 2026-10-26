import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { type ICoreDisplay, type IPad } from './rhythm-game.model';
import { type IScorePop } from './rhythm-game.state';

/** CSS class per pad index (colour scheme) and per pop position (above that pad). */
const PAD_CLASSES: readonly string[] = ['p0', 'p1', 'p2', 'p3'];
const POP_CLASSES: readonly string[] = ['q0', 'q1', 'q2', 'q3'];

/** The circular board of four drum pads, its centre display and floating score pops. */
@Component({
  selector: 'app-game-pads',
  templateUrl: './game-pads.component.html',
  styleUrl: './game-pads.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePadsComponent {
  public readonly pads = input.required<readonly IPad[]>();
  /** Index of the lit pad, or -1. */
  public readonly lit = input.required<number>();
  public readonly core = input.required<ICoreDisplay>();
  public readonly pops = input.required<readonly IScorePop[]>();
  /** Emits the index of the pad the player taps. */
  public readonly tapped = output<number>();

  protected readonly padClasses = PAD_CLASSES;
  protected readonly popClasses = POP_CLASSES;
}
