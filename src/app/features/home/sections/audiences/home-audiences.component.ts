import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type AudiencesModel } from './audiences.model';
import { HomeAudiencesViewModel } from './home-audiences.view-model';

/** "Who it's for" (design `#for-everyone`): heading and three audience cards with tags. */
@Component({
  selector: 'app-home-audiences',
  imports: [IconComponent],
  templateUrl: './home-audiences.component.html',
  styleUrl: './home-audiences.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeAudiencesViewModel],
})
export class HomeAudiencesComponent extends BaseComponent<AudiencesModel> {
  protected override readonly model = inject(HomeAudiencesViewModel);
  protected readonly anchor = PageAnchor.ForEveryone;
}
