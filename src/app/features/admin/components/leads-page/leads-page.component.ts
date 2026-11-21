import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { type Lead } from '../../models/lead.model';
import { LeadsPageViewModel } from '../../view-models/leads-page.view-model';
import { LeadCardComponent } from '../lead-card/lead-card.component';
import { LeadFiltersComponent } from '../lead-filters/lead-filters.component';
import { LeadsAnalysisComponent } from '../leads-analysis/leads-analysis.component';

/** Leads (0018 V12): every proposal from the website, to follow up and keep track of. */
@Component({
  selector: 'app-leads-page',
  imports: [ButtonDirective, LeadCardComponent, LeadFiltersComponent, LeadsAnalysisComponent],
  templateUrl: './leads-page.component.html',
  styleUrl: './leads-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LeadsPageViewModel],
})
export default class LeadsPageComponent extends BaseComponent<readonly Lead[]> {
  protected override readonly model = inject(LeadsPageViewModel);
  protected readonly ghost = ButtonVariant.Ghost;
}
