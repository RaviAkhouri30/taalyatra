import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { type SpeedReportModel } from '../../models/speed-report.model';
import { SpeedReportViewModel } from '../../view-models/speed-report.view-model';

/** How fast the site really is for visitors, on the dashboard (ADR-0016, 0012). */
@Component({
  selector: 'app-speed-report',
  templateUrl: './speed-report.component.html',
  styleUrl: './speed-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SpeedReportViewModel],
})
export class SpeedReportComponent extends BaseComponent<SpeedReportModel> {
  protected override readonly model = inject(SpeedReportViewModel);
}
