import { createResetPasswordForm, createSignInForm } from './auth-forms';

describe('auth forms', () => {
  it('should be invalid until a valid email and password are entered', () => {
    const form = createSignInForm();

    expect(form.valid).toBe(false);
    form.setValue({ email: 'owner@example.com', password: '12345' });
    expect(form.controls.password.errors).toEqual({ passwordLength: true });
    form.controls.password.setValue('123456');
    expect(form.valid).toBe(true);
  });

  it('should need a valid email to reset a password', () => {
    const form = createResetPasswordForm();

    form.setValue({ email: 'owner@example' });
    expect(form.controls.email.errors).toEqual({ email: true });
    form.setValue({ email: 'owner@example.com' });
    expect(form.valid).toBe(true);
  });
});
