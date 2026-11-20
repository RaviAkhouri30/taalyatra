import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { type FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { EMAIL_MAX_LENGTH } from '../../forms/auth-limits.constants';
import { fieldErrorMessage } from '../../forms/field-errors';
import { type IRoleControls } from '../../forms/role-form';
import { PAGE_ACCESS_CHOICES } from '../../models/role.model';
import { AREA_ROWS, PAGE_ROWS, RoleFormMode, accessLabel } from '../../models/team-access.model';

/** The fields whose errors the form shows. */
type CheckedField = 'uid' | 'email';

/** Team access's form (0019): a manager's account, and what they may do on each page. */
@Component({
  selector: 'app-manager-form',
  imports: [ButtonDirective, ReactiveFormsModule],
  templateUrl: './manager-form.component.html',
  styleUrl: './manager-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagerFormComponent {
  /** The form, owned by the page's view model. */
  public readonly form = input.required<FormGroup<IRoleControls>>();
  /** Adding a new manager, or changing one. */
  public readonly mode = input.required<RoleFormMode>();
  /** Its heading: adding, or whom it changes. */
  public readonly heading = input.required<string>();
  /** Whether a save is in flight. */
  public readonly saving = input(false);
  /** The owner asked to save. */
  public readonly submitted = output();
  /** The owner closed the form without saving. */
  public readonly cancelled = output();

  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly rows = PAGE_ROWS;
  protected readonly areaRows = AREA_ROWS;
  protected readonly choices = PAGE_ACCESS_CHOICES.map((access) => ({
    access,
    label: accessLabel(access),
  }));
  protected readonly emailMax = EMAIL_MAX_LENGTH;
  protected readonly adding = computed(() => this.mode() === RoleFormMode.Adding);

  /**
   * @param field A checked field.
   * @returns What to fix in it, once the owner has left it; otherwise `null`.
   */
  protected errorOf(field: CheckedField): string | null {
    const control = this.form().get(field);
    return control?.invalid && control.touched ? fieldErrorMessage(control.errors) : null;
  }
}
