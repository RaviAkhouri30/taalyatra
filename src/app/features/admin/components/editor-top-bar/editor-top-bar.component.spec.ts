import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import fakeDb from '@core/backends/fake/fake-db.json';
import { AdminPageModel } from '../../models/admin-page.model';
import { EditorNavService } from '../../services/editor-nav.service';
import { provideEditorTesting } from '../../testing/editor-testing';
import { EditorLayoutViewModel } from '../../view-models/editor-layout.view-model';
import { EditorTopBarComponent } from './editor-top-bar.component';

describe('EditorTopBarComponent', () => {
  function render() {
    const signOut = vi.fn(() => of(undefined));
    TestBed.configureTestingModule({
      providers: [
        ...provideEditorTesting().providers,
        provideRouter([]),
        EditorNavService,
        {
          provide: EditorLayoutViewModel,
          useValue: {
            data: () => new AdminPageModel(fakeDb.pages.admin, fakeDb.site.config.brand),
            email: () => 'owner@example.com',
            signingOut: () => false,
            signOut,
          },
        },
        { provide: IAuthService, useValue: { user$: of(null) } },
      ],
    });
    const fixture = TestBed.createComponent(EditorTopBarComponent);
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement, signOut };
  }

  it('should name the site and the account', () => {
    const { element } = render();

    expect(element.querySelector('.ed-brand')?.textContent).toContain('admin');
    expect(element.querySelector('.who')?.textContent).toContain('owner@example.com');
  });

  it('should tell the layout when Menu is pressed, and take focus back', () => {
    const { fixture, element } = render();
    const pressed = vi.fn();
    fixture.componentInstance.menuToggled.subscribe(pressed);
    document.body.append(element);

    element.querySelector<HTMLButtonElement>('.ed-menu')?.click();
    fixture.componentInstance.focusMenu();

    expect(pressed).toHaveBeenCalled();
    expect(document.activeElement).toBe(element.querySelector('.ed-menu'));
    element.remove();
  });

  it('should sign out when asked', () => {
    const { element, signOut } = render();

    Array.from(element.querySelectorAll('button'))
      .find((button) => button.textContent.trim() === 'Sign out')
      ?.click();

    expect(signOut).toHaveBeenCalled();
  });
});
