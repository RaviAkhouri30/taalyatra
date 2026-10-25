import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { HomeTrustViewModel } from './home-trust.view-model';
import { type TrustCardModel } from './trust-card.model';

/** Row of four reassurance cards under the strip (facilitation, group size, venues). */
@Component({
  selector: 'app-home-trust',
  imports: [IconComponent],
  templateUrl: './home-trust.component.html',
  styleUrl: './home-trust.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeTrustViewModel],
})
export class HomeTrustComponent extends BaseComponent<readonly TrustCardModel[]> {
  protected override readonly model = inject(HomeTrustViewModel);
}
