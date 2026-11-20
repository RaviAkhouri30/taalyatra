import { Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TourTargetDirective } from '../../directives/tour-target.directive';
import { TourTarget } from '../../models/tour.model';
import { EditorNavService } from '../../services/editor-nav.service';
import { TourService } from '../../services/tour.service';
import { provideEditorTesting } from '../../testing/editor-testing';
import { TourComponent } from './tour.component';

/** A page with the menu area the tour points at, a button to start from, and the overlay. */
@Component({
  imports: [TourComponent, TourTargetDirective],
  template: `
    <button type="button" id="start">Start</button>
    @if (showMenu()) {
      <nav [appTourTarget]="menu">Menu</nav>
    }
    <app-tour />
  `,
})
class HostComponent {
  public readonly showMenu = signal(true);
  public readonly tour = inject(TourService);
  protected readonly menu = TourTarget.Menu;
}

describe('TourComponent', () => {
  function render(drawer = false) {
    vi.stubGlobal('matchMedia', () => ({ matches: drawer }));
    TestBed.configureTestingModule({
      providers: [...provideEditorTesting().providers, TourService, EditorNavService],
    });
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement as HTMLElement);
    const element = fixture.nativeElement as HTMLElement;
    const nav = element.querySelector('nav')!;
    vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 40,
      width: 200,
      height: 300,
    } as DOMRect);
    nav.scrollIntoView = vi.fn();
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    const start = element.querySelector<HTMLButtonElement>('#start')!;
    return { fixture, element, tour: fixture.componentInstance.tour, settle, start };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should show nothing while the tour isn’t running', () => {
    const { element } = render();

    expect(element.querySelector('[role="dialog"]')).toBeNull();
  });

  it('should show a step with no area on its own, focused', async () => {
    const { element, tour, settle, start } = render();
    start.focus();

    tour.start();
    await settle();

    const card = element.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(card.querySelector('h2')?.textContent).toBe('Welcome to the admin');
    expect(card.classList).toContain('tour-card--alone');
    expect(element.querySelector('.tour-shade')).not.toBeNull();
    expect(document.activeElement).toBe(card);
  });

  it('should frame the step’s area and place the card beside it', async () => {
    const { element, tour, settle } = render();
    tour.start();
    tour.next();
    await settle();

    const frame = element.querySelector<HTMLElement>('[data-testid="tour-frame"]')!;
    expect(frame.style.top).toBe('94px');
    expect(frame.style.width).toBe('212px');
    expect(element.querySelector<HTMLElement>('[role="dialog"]')!.style.top).toBe('412px');
  });

  it('should measure again when the page scrolls', async () => {
    const { element, tour, settle } = render();
    tour.start();
    tour.next();
    await settle();
    const nav = element.querySelector('nav')!;
    vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue({
      top: 20,
      left: 40,
      width: 200,
      height: 300,
    } as DOMRect);

    document.dispatchEvent(new Event('scroll'));
    await settle();

    expect(element.querySelector<HTMLElement>('[data-testid="tour-frame"]')!.style.top).toBe(
      '14px',
    );
  });

  it('should show the card alone when the area isn’t on the page', async () => {
    const { fixture, element, tour, settle } = render();
    fixture.componentInstance.showMenu.set(false);
    tour.start();
    tour.next();
    await settle();

    expect(element.querySelector('[data-testid="tour-frame"]')).toBeNull();
    expect(element.querySelector('[role="dialog"] h2')?.textContent).toBe(
      'Every page, in one menu',
    );
  });

  it('should move with Next and Back, and end with Done, giving focus back', async () => {
    const { element, tour, settle, start } = render();
    start.focus();
    tour.start();
    await settle();
    const press = async (name: string) => {
      Array.from(element.querySelectorAll<HTMLButtonElement>('[role="dialog"] button'))
        .find((button) => button.textContent.trim() === name)!
        .click();
      await settle();
    };

    await press('Next');
    await press('Back');
    expect(element.querySelector('[role="dialog"] h2')?.textContent).toBe('Welcome to the admin');
    for (let step = 0; step < 8; step += 1) {
      await press('Next');
    }
    await press('Done');

    expect(element.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(start);
  });

  it('should close with Escape', async () => {
    const { element, tour, settle } = render();
    tour.start();
    await settle();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await settle();

    expect(element.querySelector('[role="dialog"]')).toBeNull();
  });

  it('should keep Tab inside the card', async () => {
    const { element, tour, settle } = render();
    tour.start();
    tour.next();
    await settle();
    const card = element.querySelector<HTMLElement>('[role="dialog"]')!;
    const buttons = Array.from(card.querySelectorAll<HTMLButtonElement>('button'));
    const tab = (shiftKey: boolean) => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true });
      card.dispatchEvent(event);
      return event.defaultPrevented;
    };

    buttons.at(-1)!.focus();
    expect(tab(false)).toBe(true);
    expect(document.activeElement).toBe(buttons[0]);
    expect(tab(true)).toBe(true);
    expect(document.activeElement).toBe(buttons.at(-1));
    buttons[1]!.focus();
    expect(tab(false)).toBe(false);
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  });

  it('should open the menu drawer for a step in it on a narrow screen, and close it after', async () => {
    const { tour, settle } = render(true);
    const nav = TestBed.inject(EditorNavService);
    tour.start();
    tour.next();
    await settle();
    expect(nav.drawerOpen()).toBe(true);

    tour.next();
    tour.next();
    await settle();
    expect(nav.drawerOpen()).toBe(false);

    tour.back();
    await settle();
    tour.close();
    await settle();
    expect(nav.drawerOpen()).toBe(false);
  });
});
