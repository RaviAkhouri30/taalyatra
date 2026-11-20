import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { type IFeatureGroup } from '../../models/features-page.model';
import { FeaturesPageViewModel } from '../../view-models/features-page.view-model';

/** Features (0020 V18): what the website and the admin do, and where each is changed. */
@Component({
  selector: 'app-features-page',
  imports: [IconComponent, RouterLink],
  templateUrl: './features-page.component.html',
  styleUrl: './features-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FeaturesPageViewModel],
})
export default class FeaturesPageComponent extends BaseComponent<readonly IFeatureGroup[]> {
  protected override readonly model = inject(FeaturesPageViewModel);
}
