/** Admin area copy as stored in `pages/admin`. */
export interface IAdminPageDto {
  readonly signIn: {
    readonly heading: string;
    readonly lead: string;
    readonly emailLabel: string;
    readonly emailPlaceholder: string;
    readonly passwordLabel: string;
    readonly passwordPlaceholder: string;
    readonly submit: string;
    readonly submitting: string;
    readonly forgot: string;
    readonly note: string;
    readonly back: string;
  };
  readonly reset: {
    readonly heading: string;
    readonly lead: string;
    readonly submit: string;
    readonly submitting: string;
    readonly sent: string;
    readonly backToSignIn: string;
  };
  readonly home: {
    readonly heading: string;
    readonly lead: string;
    readonly signedInAs: string;
    readonly viewSite: string;
    readonly signOut: string;
    readonly signingOut: string;
  };
  readonly errors: {
    readonly emailRequired: string;
    readonly emailInvalid: string;
    readonly passwordRequired: string;
    readonly passwordLength: string;
    readonly invalidCredentials: string;
    readonly tooManyAttempts: string;
    readonly network: string;
    readonly notAdmin: string;
    readonly unknown: string;
  };
}
