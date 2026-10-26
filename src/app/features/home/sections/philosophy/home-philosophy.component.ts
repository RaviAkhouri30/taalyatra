import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { HomePhilosophyViewModel } from './home-philosophy.view-model';
import { type IPhilosophyDto } from './i-philosophy';

/** Philosophy (design `#philosophy`): statement, three pillars, goals and the journey timeline. */
@Component({
  selector: 'app-home-philosophy',
  templateUrl: './home-philosophy.component.html',
  styleUrl: './home-philosophy.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomePhilosophyViewModel],
})
export class HomePhilosophyComponent extends BaseComponent<IPhilosophyDto> {
  protected override readonly model = inject(HomePhilosophyViewModel);
  protected readonly anchor = PageAnchor.Philosophy;
}
