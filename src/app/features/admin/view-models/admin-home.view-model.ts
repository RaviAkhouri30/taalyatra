import { Injectable, type Signal, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { EMPTY, type Observable, Subject, catchError, exhaustMap, finalize, map, tap } from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { AppRoute } from '@shared/enums/app-route.enum';
import { AdminPageViewModel } from './admin-page.view-model';

/** The admin home: shows who is signed in and signs out. */
@Injectable()
export class AdminHomeViewModel extends AdminPageViewModel {
  public readonly signingOut = signal(false);
  /** Email of the signed-in account; empty while unknown. */
  public readonly email: Signal<string>;

  private readonly auth = inject(IAuthService);
  private readonly router = inject(Router);
  private readonly signOuts = new Subject<void>();

  public constructor() {
    super();
    // Assigned here because it reads `auth`, a private field declared after the public ones.
    this.email = toSignal(this.auth.user$.pipe(map((user) => user?.email ?? '')), {
      initialValue: '',
    });
  }

  /** Signs out and returns to the sign-in page. */
  public signOut(): void {
    this.signOuts.next();
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return this.signOuts.pipe(
      tap(() => {
        this.signingOut.set(true);
      }),
      // exhaustMap: repeat clicks while signing out are ignored.
      exhaustMap(() =>
        this.auth.signOut().pipe(
          tap(() => {
            // The navigation's result isn't needed: the sign-in page renders either way.
            void this.router.navigateByUrl(AppRoute.AdminSignIn);
          }),
          catchError(() => EMPTY),
          finalize(() => {
            this.signingOut.set(false);
          }),
        ),
      ),
    );
  }
}
