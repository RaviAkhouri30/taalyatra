import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideEditorTesting } from '../../testing/editor-testing';
import { TourService } from '../../services/tour.service';
import { HelpMenuComponent } from './help-menu.component';

describe('HelpMenuComponent', () => {
  function render() {
    TestBed.configureTestingModule({
      providers: [...provideEditorTesting().providers, TourService],
    });
    // The tour opens its steps' pages; these specs have no admin routes.
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(HelpMenuComponent);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement as HTMLElement);
    const element = fixture.nativeElement as HTMLElement;
    const help = element.querySelector<HTMLButtonElement>('.hm-button')!;
    const open = () => {
      help.click();
      fixture.detectChanges();
    };
    return { fixture, element, help, open, tour: TestBed.inject(TourService) };
  }

  it('should open a menu with the tour, Features, What’s new and Install (0026)', () => {
    const { element, help, open } = render();

    open();

    expect(help.getAttribute('aria-expanded')).toBe('true');
    expect(
      Array.from(element.querySelectorAll('li')).map((item) => item.textContent.trim()),
    ).toEqual(['Take the tour', 'Features', 'What’s new', 'Install on your phone']);
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/admin/features');
    expect(Array.from(element.querySelectorAll('a')).at(-1)?.getAttribute('href')).toBe(
      '/admin/install',
    );
  });

  it('should start the tour, closing the menu and keeping focus on Help', () => {
    const { fixture, element, help, open, tour } = render();
    open();

    element.querySelector<HTMLButtonElement>('li button')!.click();
    fixture.detectChanges();

    expect(tour.step()?.id).toBe('welcome');
    expect(element.querySelector('ul')).toBeNull();
    expect(document.activeElement).toBe(help);
  });

  it('should close on Escape, giving focus back to Help when it was inside', () => {
    const { fixture, element, help, open } = render();
    open();
    element.querySelector<HTMLAnchorElement>('a')!.focus();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(element.querySelector('ul')).toBeNull();
    expect(document.activeElement).toBe(help);
  });

  it('should close on a click outside, and ignore Escape when closed', () => {
    const { fixture, element, open } = render();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    open();

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(element.querySelector('ul')).toBeNull();
  });

  it('should stay open for a click inside', () => {
    const { fixture, element, open } = render();
    open();

    element.querySelector('ul')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(element.querySelector('ul')).not.toBeNull();
  });
});
