import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { FakeAuthService } from '@core/backends/fake/fake-auth.service';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { provideFakeContent } from '@shared/testing/fixtures';
import { FAKE_ADMIN_ACCOUNT } from '@core/backends/fake/fake-auth.constants';
import SignInComponent from './sign-in.component';

describe('SignInComponent', () => {
  function render(reason?: string) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideFakeContent().provider,
        { provide: IAuthService, useClass: FakeAuthService },
      ],
    });
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(SignInComponent);
    if (reason) fixture.componentRef.setInput('reason', reason);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const field = (name: string) =>
      element.querySelector<HTMLInputElement>(`[formControlName="${name}"]`)!;
    const type = (name: string, value: string) => {
      field(name).value = value;
      field(name).dispatchEvent(new Event('input'));
      field(name).dispatchEvent(new Event('blur'));
    };
    const submit = () => {
      element.querySelector('form')!.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
    };
    return { element, field, type, submit };
  }

  it('should render the design: heading, labelled fields, button, links and note', () => {
    const { element, field } = render();

    expect(element.querySelector('h1')?.textContent).toBe('Admin sign in');
    expect(field('email').getAttribute('autocomplete')).toBe('username');
    expect(field('password').getAttribute('type')).toBe('password');
    expect(element.querySelector('button[type="submit"]')?.textContent.trim()).toBe('Sign in');
    expect(element.querySelector('.llink')?.getAttribute('href')).toBe('/admin/reset-password');
    expect(element.querySelector('.lnote')?.textContent).toBe('Single admin account');
  });

  it('should show accessible inline errors for empty fields', () => {
    const { element, field, submit } = render();

    submit();

    expect(field('email').getAttribute('aria-invalid')).toBe('true');
    expect(field('email').getAttribute('aria-describedby')).toBe('sign-in-email-error');
    expect(element.querySelector('#sign-in-email-error')?.textContent).toBe('Enter your email.');
    expect(element.querySelector('#sign-in-password-error')?.textContent).toBe(
      'Enter your password.',
    );
  });

  it('should explain an invalid email and a too-short password', () => {
    const { element, type, submit } = render();
    type('email', 'owner@example');
    type('password', '123');

    submit();

    expect(element.querySelector('#sign-in-email-error')?.textContent).toContain('valid email');
    expect(element.querySelector('#sign-in-password-error')?.textContent).toContain('6 to 128');
  });

  it('should show one generic message for wrong credentials', () => {
    const { element, type, submit } = render();
    type('email', FAKE_ADMIN_ACCOUNT.email);
    type('password', 'not-the-password');

    submit();

    expect(element.querySelector('[role="alert"]')?.textContent).toBe(
      'Email or password is incorrect.',
    );
  });

  it('should explain why another account was turned away', () => {
    expect(render('not-admin').element.querySelector('[role="alert"]')?.textContent).toBe(
      'This account can’t use the admin area.',
    );
  });
});
