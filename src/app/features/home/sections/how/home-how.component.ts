import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { StepsComponent } from '@shared/components/steps/steps.component';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { HomeHowViewModel } from './home-how.view-model';
import { type IHowDto } from './i-how';

/** "How it works" (design `#how`): four steps from enquiry to the session. */
@Component({
  selector: 'app-home-how',
  imports: [StepsComponent],
  templateUrl: './home-how.component.html',
  styleUrl: './home-how.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeHowViewModel],
})
export class HomeHowComponent extends BaseComponent<IHowDto> {
  protected override readonly model = inject(HomeHowViewModel);
  protected readonly anchor = PageAnchor.How;
}
