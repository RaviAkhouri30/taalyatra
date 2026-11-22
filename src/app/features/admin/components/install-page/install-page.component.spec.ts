import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminAppService } from '../../services/admin-app.service';
import InstallPageComponent from './install-page.component';

describe('InstallPageComponent (0026)', () => {
  function render(canInstall: boolean, installedApp = false) {
    const app = {
      canInstall: signal(canInstall),
      isInstalledApp: () => installedApp,
      install: vi.fn(() => of(true)),
    };
    TestBed.configureTestingModule({ providers: [{ provide: AdminAppService, useValue: app }] });
    const fixture = TestBed.createComponent(InstallPageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, element, app };
  }

  it('should show the steps for Android and iPhone', () => {
    const { element } = render(false);

    expect(
      Array.from(element.querySelectorAll('h2')).map((heading) => heading.textContent),
    ).toEqual(['On Android', 'On iPhone']);
    expect(element.querySelector('button')).toBeNull();
  });

  it('should offer Install when the browser does, and say when it’s done', () => {
    const { fixture, element, app } = render(true);

    element.querySelector('button')?.click();
    fixture.detectChanges();

    expect(app.install).toHaveBeenCalled();
    expect(element.querySelector('.ip-answer')?.textContent).toContain('Installed.');
  });

  it('should say when it’s already the app', () => {
    const { element } = render(true, true);

    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'You’re using the installed app.',
    );
    expect(element.querySelector('h2')).toBeNull();
  });
});
