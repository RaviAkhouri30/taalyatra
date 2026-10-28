import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FakeAuthService } from '@core/backends/fake/fake-auth.service';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { provideFakeContent } from '@shared/testing/fixtures';
import ResetPasswordComponent from './reset-password.component';

describe('ResetPasswordComponent', () => {
  function render() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideFakeContent().provider,
        { provide: IAuthService, useClass: FakeAuthService },
      ],
    });
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector<HTMLInputElement>('[formControlName="email"]')!;
    const submit = async (email: string) => {
      input.value = email;
      input.dispatchEvent(new Event('input'));
      element.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
      fixture.detectChanges();
    };
    return { element, submit, fixture };
  }

  it('should explain an invalid email and send nothing', async () => {
    const { element, submit } = render();

    await submit('owner@example');

    expect(element.querySelector('#reset-email-error')?.textContent).toContain('valid email');
    expect(element.querySelector('[role="status"]')).toBeNull();
  });

  it('should confirm, without revealing whether the email has an account', async () => {
    const { element, submit, fixture } = render();

    await submit('owner@example.com');
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(element.querySelector('[role="status"]')).not.toBeNull();
    });

    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'If that email has an admin account',
    );
    expect(element.querySelector('form')).toBeNull();
    expect(element.querySelector('.llink')?.getAttribute('href')).toBe('/admin/sign-in');
  });
});
