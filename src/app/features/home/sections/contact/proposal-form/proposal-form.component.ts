import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { type FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { type IProposalFormCopyDto } from '../i-contact';
import { type ProposalControls } from '../proposal-form';
import { PROPOSAL_MAX_LENGTH } from '../proposal-limits.constants';
import { ProposalStatus } from '../proposal-status.enum';

/** Fields that can show an inline error. */
type CheckedField = 'name' | 'phone' | 'email';

/**
 * The proposal form (design `.panel`). Presentational: the view model owns the form group and
 * sends the request; this component renders the fields, inline errors and the status message.
 */
@Component({
  selector: 'app-proposal-form',
  imports: [ButtonDirective, IconComponent, ReactiveFormsModule],
  templateUrl: './proposal-form.component.html',
  styleUrl: './proposal-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProposalFormComponent {
  public readonly copy = input.required<IProposalFormCopyDto>();
  public readonly form = input.required<FormGroup<ProposalControls>>();
  public readonly status = input.required<ProposalStatus>();
  public readonly whatsAppHref = input.required<string>();
  /** Emitted when the visitor asks for a proposal. */
  public readonly submitted = output();

  protected readonly buttonVariant = ButtonVariant;
  protected readonly whatsAppIcon = IconName.WhatsApp;
  protected readonly proposalStatus = ProposalStatus;
  /** Stops typing at the same limits the form and `firestore.rules` enforce. */
  protected readonly maxLength = PROPOSAL_MAX_LENGTH;
  protected readonly sending = computed(() => this.status() === ProposalStatus.Sending);

  /** @returns Whether `field`'s error should be shown (invalid after the visitor left it). */
  protected showError(field: CheckedField): boolean {
    const control = this.form().get(field);
    return Boolean(control?.invalid && control.touched);
  }

  protected onSubmit(): void {
    this.submitted.emit();
  }
}
