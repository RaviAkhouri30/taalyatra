import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { FoldComponent } from '@shared/components/fold/fold.component';
import { FoldMode } from '@shared/enums/fold-mode.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { HomePhilosophyViewModel } from './home-philosophy.view-model';
import { type IPhilosophyDto } from './i-philosophy';

/** Philosophy (design `#philosophy`): statement, three pillars, goals and the journey timeline. */
@Component({
  selector: 'app-home-philosophy',
  imports: [FoldComponent],
  templateUrl: './home-philosophy.component.html',
  styleUrl: './home-philosophy.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomePhilosophyViewModel],
})
export class HomePhilosophyComponent extends BaseComponent<IPhilosophyDto> {
  /** When the section's content folds behind Show more (0015 V15). */
  public readonly fold = input(FoldMode.Never);
  protected override readonly model = inject(HomePhilosophyViewModel);
  protected readonly anchor = PageAnchor.Philosophy;
}
