import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { HomeCitiesViewModel } from './home-cities.view-model';
import { type ICitiesDto } from './i-cities';

/** "Where we play": home base and the cities served, active ones highlighted. */
@Component({
  selector: 'app-home-cities',
  templateUrl: './home-cities.component.html',
  styleUrl: './home-cities.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeCitiesViewModel],
})
export class HomeCitiesComponent extends BaseComponent<ICitiesDto> {
  protected override readonly model = inject(HomeCitiesViewModel);
}
