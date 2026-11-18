import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { type VisitsPageModel } from '../../models/visits-page.model';
import { CHART_PERIODS, VisitsPageViewModel } from '../../view-models/visits-page.view-model';
import { BarChartComponent } from '../bar-chart/bar-chart.component';

/** Visits (0018 V11): how many come to the site, and how many ask for a proposal. */
@Component({
  selector: 'app-visits-page',
  imports: [BarChartComponent],
  templateUrl: './visits-page.component.html',
  styleUrl: './visits-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VisitsPageViewModel],
})
export default class VisitsPageComponent extends BaseComponent<VisitsPageModel> {
  protected override readonly model = inject(VisitsPageViewModel);
  protected readonly periods = CHART_PERIODS;
}
