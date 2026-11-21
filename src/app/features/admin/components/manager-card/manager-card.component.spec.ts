import { TestBed } from '@angular/core/testing';
import { EditorTab } from '../../models/editor-tab.enum';
import { PageAccess } from '../../models/role.model';
import { ManagerCardComponent } from './manager-card.component';

describe('ManagerCardComponent', () => {
  const manager = {
    uid: 'manager-uid',
    role: {
      email: 'm@b.co',
      pages: new Map([
        [EditorTab.Hero, PageAccess.Publish],
        [EditorTab.Team, PageAccess.Hidden],
      ]),
      uploads: false,
      addedAt: '2026-10-31T10:00:00.000Z',
    },
  };

  function render(confirming = false) {
    const fixture = TestBed.createComponent(ManagerCardComponent);
    fixture.componentRef.setInput('manager', manager);
    fixture.componentRef.setInput('confirming', confirming);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const buttons = () => Array.from(element.querySelectorAll('button'));
    return { component: fixture.componentInstance, element, buttons };
  }

  it('should show who it is and what they can do on each page', () => {
    const { element } = render();
    const groups = Array.from(element.querySelectorAll('.mgr-access div')).map(
      (group) =>
        `${group.querySelector('dt')?.textContent ?? ''} · ${group.querySelector('dd')?.textContent ?? ''}`,
    );

    expect(element.querySelector('h2')?.textContent).toBe('m@b.co');
    expect(element.querySelector('code')?.textContent).toBe('manager-uid');
    expect(element.querySelector('.mgr-when')?.textContent).toContain('31 Oct 2026');
    expect(groups[0]).toBe('Can publish · Hero');
    expect(groups.at(-4)).toBe('Hidden · Team');
    expect(groups.at(-3)).toBe('Photo uploads · Can’t upload');
    expect(groups.at(-2)).toBe('Approving · Sends them to you');
    expect(groups.at(-1)).toBe('Your areas · None');
  });

  it('should say when they can upload photos', () => {
    const fixture = TestBed.createComponent(ManagerCardComponent);
    fixture.componentRef.setInput('manager', {
      ...manager,
      role: { ...manager.role, uploads: true },
    });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Can upload');
  });

  it('should ask to change or remove them', () => {
    const { component, buttons } = render();
    const edit = vi.fn();
    const remove = vi.fn();
    component.editAsked.subscribe(edit);
    component.removeAsked.subscribe(remove);

    buttons()[0]?.click();
    buttons()[1]?.click();

    expect(buttons()[0]?.getAttribute('aria-label')).toBe('Change m@b.co');
    expect(edit).toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();
  });

  it('should confirm or cancel a removal', () => {
    const { component, element, buttons } = render(true);
    const confirmed = vi.fn();
    const cancelled = vi.fn();
    component.removeConfirmed.subscribe(confirmed);
    component.removeCancelled.subscribe(cancelled);

    buttons()[0]?.click();
    buttons()[1]?.click();

    expect(element.querySelector('.mgr-confirm p')?.textContent).toContain('loses access');
    expect(confirmed).toHaveBeenCalled();
    expect(cancelled).toHaveBeenCalled();
  });

  it('should say how long a super manager lasts, and nothing for anyone else (0024)', () => {
    const fixture = TestBed.createComponent(ManagerCardComponent);
    fixture.componentRef.setInput('manager', {
      ...manager,
      role: { ...manager.role, superManager: { since: 'x', untilMs: null } },
    });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[data-access="super"] dd')?.textContent).toBe('For good');
    expect(render().element.querySelector('[data-access="super"]')).toBeNull();
  });
});
