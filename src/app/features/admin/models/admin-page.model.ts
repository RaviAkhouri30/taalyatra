import { type ValidationErrors } from '@angular/forms';
import { AuthErrorKind } from '@core/enums/auth-error-kind.enum';
import { type IBrand } from '@shared/interfaces/i-brand';
import { type IAdminPageDto } from './i-admin-page';

/** The admin area's copy and brand, with the messages for each failure. */
export class AdminPageModel {
  public readonly signIn: IAdminPageDto['signIn'];
  public readonly reset: IAdminPageDto['reset'];
  public readonly home: IAdminPageDto['home'];
  public readonly errors: IAdminPageDto['errors'];

  private readonly messages: ReadonlyMap<AuthErrorKind, string>;

  /**
   * @param dto The stored copy.
   * @param brand The site's brand (logo and name) from site config.
   */
  public constructor(
    dto: IAdminPageDto,
    public readonly brand: IBrand,
  ) {
    this.signIn = dto.signIn;
    this.reset = dto.reset;
    this.home = dto.home;
    this.errors = dto.errors;
    this.messages = new Map([
      [AuthErrorKind.InvalidCredentials, dto.errors.invalidCredentials],
      [AuthErrorKind.TooManyAttempts, dto.errors.tooManyAttempts],
      [AuthErrorKind.Network, dto.errors.network],
    ]);
  }

  /** @returns The message for an authentication failure. */
  public messageFor(kind: AuthErrorKind): string {
    return this.messages.get(kind) ?? this.errors.unknown;
  }

  /** @returns The message for an invalid email field. */
  public emailError(errors: ValidationErrors | null): string {
    return errors?.['required'] ? this.errors.emailRequired : this.errors.emailInvalid;
  }

  /** @returns The message for an invalid password field. */
  public passwordError(errors: ValidationErrors | null): string {
    return errors?.['required'] ? this.errors.passwordRequired : this.errors.passwordLength;
  }
}
