import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { type ReleasesPageModel } from '../../models/releases-page.model';
import { ReleasesPageViewModel } from '../../view-models/releases-page.view-model';

/** What's new (0016 V1): each release's notes, the newest open. */
@Component({
  selector: 'app-releases',
  templateUrl: './releases.component.html',
  styleUrl: './releases.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ReleasesPageViewModel],
})
export default class ReleasesComponent extends BaseComponent<ReleasesPageModel> {
  protected override readonly model = inject(ReleasesPageViewModel);
}
