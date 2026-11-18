import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { type FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { type ILeadFilterControls } from '../../forms/lead-filter-form';
import { LEAD_STATUSES } from '../../models/lead.model';
import { type ILeadFilterOptions } from '../../models/leads-page.model';

/** The Leads page's filters (0018 V12): status, event, group size, month and a search. */
@Component({
  selector: 'app-lead-filters',
  imports: [ButtonDirective, ReactiveFormsModule],
  templateUrl: './lead-filters.component.html',
  styleUrl: './lead-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadFiltersComponent {
  /** The filters' form, owned by the page's view model. */
  public readonly form = input.required<FormGroup<ILeadFilterControls>>();
  /** The choices, from the leads themselves. */
  public readonly options = input.required<ILeadFilterOptions>();
  /** The owner asked to see every lead again. */
  public readonly cleared = output();

  protected readonly statuses = LEAD_STATUSES;
  protected readonly ghost = ButtonVariant.Ghost;
}
