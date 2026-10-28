import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FakeAuthService } from '@core/backends/fake/fake-auth.service';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { provideFakeContent } from '@shared/testing/fixtures';
import { firstValueFrom } from 'rxjs';
import { FAKE_ADMIN_ACCOUNT } from '@core/backends/fake/fake-auth.constants';
import AdminHomeComponent from './admin-home.component';

describe('AdminHomeComponent', () => {
  it('should show the signed-in email, a link to the site and a sign-out button', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideFakeContent().provider,
        { provide: IAuthService, useClass: FakeAuthService },
      ],
    });
    await firstValueFrom(
      TestBed.inject(IAuthService).signIn(FAKE_ADMIN_ACCOUNT.email, FAKE_ADMIN_ACCOUNT.password),
    );
    const fixture = TestBed.createComponent(AdminHomeComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toBe('Welcome back');
    expect(element.querySelector('.who b')?.textContent).toBe(FAKE_ADMIN_ACCOUNT.email);
    expect(element.querySelector('.actions a')?.getAttribute('href')).toBe('/');
    expect(element.querySelector('.actions button')?.textContent.trim()).toBe('Sign out');
  });
});
