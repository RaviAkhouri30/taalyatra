import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AccountErrorKind } from '@core/enums/account-error-kind.enum';
import { AccountError } from '@core/interfaces/i-account-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { FIREBASE_CONFIG } from '@core/tokens/firebase-config.token';
import { environment } from '@env/environment';
import { FirebaseAccountService } from './firebase-account.service';

const LIVE = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=web-key';

describe('FirebaseAccountService', () => {
  function setUp(emulator: { host: string; port: number } | null = null) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FIREBASE_CONFIG, useValue: { apiKey: 'web-key' } },
        { provide: APP_ENVIRONMENT, useValue: { ...environment, authEmulator: emulator } },
      ],
    });
    const service = TestBed.runInInjectionContext(() => new FirebaseAccountService());
    return { service, http: TestBed.inject(HttpTestingController) };
  }

  it('should make the account with a long random password and give its id', async () => {
    const { service, http } = setUp();
    const created = firstValueFrom(service.create('new@taalyatra.in'));

    const request = http.expectOne(LIVE);
    const body = request.request.body as {
      email: string;
      password: string;
      returnSecureToken: boolean;
    };
    request.flush({ localId: 'new-uid' });

    expect(await created).toBe('new-uid');
    expect(body.email).toBe('new@taalyatra.in');
    expect(body.password).toMatch(/^[\w-]{32}$/u);
    expect(body.returnSecureToken).toBe(false);
  });

  it('should ask the Auth emulator when the build uses one', () => {
    const { service, http } = setUp({ host: '127.0.0.1', port: 9099 });
    service.create('x@y.in').subscribe();

    expect(
      http.expectOne(
        'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=web-key',
      ),
    ).toBeTruthy();
  });

  it.each([
    ['EMAIL_EXISTS', AccountErrorKind.EmailTaken],
    ['ADMIN_ONLY_OPERATION', AccountErrorKind.NotAllowed],
    ['OPERATION_NOT_ALLOWED', AccountErrorKind.NotAllowed],
    ['TOO_MANY_ATTEMPTS_TRY_LATER : Try again later.', AccountErrorKind.TooMany],
    ['INVALID_EMAIL', AccountErrorKind.BadEmail],
    ['SOMETHING_ELSE', AccountErrorKind.Unknown],
  ])('should say what %s means', async (code, kind) => {
    const { service, http } = setUp();
    const created = firstValueFrom(service.create('x@y.in'));

    http.expectOne(LIVE).flush({ error: { message: code } }, { status: 400, statusText: 'Bad' });

    await expect(created).rejects.toEqual(new AccountError(kind));
  });

  it('should say Unknown when the network fails', async () => {
    const { service, http } = setUp();
    const created = firstValueFrom(service.create('x@y.in'));

    http.expectOne(LIVE).error(new ProgressEvent('error'));

    await expect(created).rejects.toMatchObject({ kind: AccountErrorKind.Unknown });
  });
});
