import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/**
 * Row of single-choice filter chips (home experiences, videos page). Two-way bind the choice
 * with `[(selected)]`. Each chip reports its state to assistive tech with `aria-pressed`.
 */
@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.component.html',
  styleUrl: './filter-chips.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterChipsComponent {
  public readonly options = input.required<readonly string[]>();
  /** Accessible name of the chip group, e.g. "Filter experiences". */
  public readonly label = input.required<string>();
  public readonly selected = model.required<string>();
}
