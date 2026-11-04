import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { AppRoute } from '@shared/enums/app-route.enum';
import { type DashboardModel } from '../../models/dashboard.model';
import { PUBLISH_PATH } from '../../models/editor-nav.constants';
import { EditorTab } from '../../models/editor-tab.enum';
import { DashboardViewModel } from '../../view-models/dashboard.view-model';
import { PublishBarComponent } from '../publish-bar/publish-bar.component';
import { SpeedReportComponent } from '../speed-report/speed-report.component';

/** The editor's home: one card per thing worth knowing, each linking to where it's changed. */
@Component({
  selector: 'app-dashboard',
  imports: [PublishBarComponent, RouterLink, SpeedReportComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DashboardViewModel],
})
export default class DashboardComponent extends BaseComponent<DashboardModel> {
  protected override readonly model = inject(DashboardViewModel);
  protected readonly links = {
    publish: `${AppRoute.Admin}/${PUBLISH_PATH}`,
    offer: `${AppRoute.Admin}/${EditorTab.Offer}`,
    visibility: `${AppRoute.Admin}/${EditorTab.Visibility}`,
  };
}
