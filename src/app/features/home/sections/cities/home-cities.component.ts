import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { FoldComponent } from '@shared/components/fold/fold.component';
import { FoldMode } from '@shared/enums/fold-mode.enum';
import { HomeCitiesViewModel } from './home-cities.view-model';
import { type ICitiesDto } from './i-cities';

/** "Where we play": home base and the cities served, active ones highlighted. */
@Component({
  selector: 'app-home-cities',
  imports: [FoldComponent],
  templateUrl: './home-cities.component.html',
  styleUrl: './home-cities.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeCitiesViewModel],
})
export class HomeCitiesComponent extends BaseComponent<ICitiesDto> {
  /** When the section's content folds behind Show more (0015 V15). */
  public readonly fold = input(FoldMode.Never);
  protected override readonly model = inject(HomeCitiesViewModel);
}
