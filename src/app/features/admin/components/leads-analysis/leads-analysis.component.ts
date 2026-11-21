import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { type IAiStatus } from '@core/interfaces/i-ai-service';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { type Lead } from '../../models/lead.model';
import { LeadsAnalysisViewModel } from '../../view-models/leads-analysis.view-model';

/** Leads' AI analysis card (0025 V12), shown once the help is set up. */
@Component({
  selector: 'app-leads-analysis',
  imports: [ButtonDirective],
  templateUrl: './leads-analysis.component.html',
  styleUrl: './leads-analysis.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LeadsAnalysisViewModel],
})
export class LeadsAnalysisComponent extends BaseComponent<IAiStatus> {
  /** The leads the filters show: what Analyse sends, as counts. */
  public readonly leads = input.required<readonly Lead[]>();

  protected override readonly model = inject(LeadsAnalysisViewModel);
  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly buttonText = computed(() => {
    const count = this.leads().length;
    return count === 1 ? 'Analyse this lead' : `Analyse these ${String(count)} leads`;
  });
}
