import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { AdminAppService } from '../services/admin-app.service';
import { INSTALL_ANSWERS, InstallPageViewModel } from './install-page.view-model';

describe('InstallPageViewModel (0026)', () => {
  function setUp(install: () => ReturnType<AdminAppService['install']>, installedApp = false) {
    const app = {
      canInstall: signal(true),
      isInstalledApp: () => installedApp,
      install: vi.fn(install),
    };
    TestBed.configureTestingModule({
      providers: [InstallPageViewModel, { provide: AdminAppService, useValue: app }],
    });
    const model = TestBed.inject(InstallPageViewModel);
    model.init().subscribe();
    return { model, app };
  }

  it('should follow the browser’s offer, and know when it’s the app already', () => {
    const { model } = setUp(() => of(true), true);

    expect(model.canInstall()).toBe(true);
    expect(model.installedApp).toBe(true);
  });

  it.each([
    [true, INSTALL_ANSWERS.accepted],
    [false, INSTALL_ANSWERS.dismissed],
  ])('should say what happened when the offer was answered %s', (accepted, answer) => {
    const { model } = setUp(() => of(accepted));

    model.install();

    expect(model.answer()).toBe(answer);
    expect(model.busy()).toBe(false);
  });

  it('should leave the steps when the browser refuses, and ignore a second click while it shows', () => {
    const showing = new Subject<boolean>();
    const { model, app } = setUp(() => showing);

    model.install();
    model.install();
    expect(app.install).toHaveBeenCalledTimes(1);
    showing.error(new Error('refused'));

    expect(model.answer()).toBe(INSTALL_ANSWERS.dismissed);
    expect(model.busy()).toBe(false);
  });

  it('should keep failing quietly', () => {
    const { model } = setUp(() => throwError(() => new Error('x')));

    model.install();

    expect(model.answer()).toBe(INSTALL_ANSWERS.dismissed);
  });
});
