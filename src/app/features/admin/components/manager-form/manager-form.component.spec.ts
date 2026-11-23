import { TestBed } from '@angular/core/testing';
import { CLOCK } from '@core/tokens/clock.token';
import { createRoleForm } from '../../forms/role-form';
import { RoleFormMode } from '../../models/team-access.model';
import { ManagerFormComponent } from './manager-form.component';

describe('ManagerFormComponent', () => {
  function render(
    mode = RoleFormMode.Adding,
    saving = false,
    invite: { pasteUid?: boolean; problem?: string; uid?: string } = {},
  ) {
    const form = createRoleForm(
      'owner-uid',
      () => new Set(),
      () => '2026-11-21',
    );
    // A fixed day in India: the date field's earliest day comes from the clock (0024).
    TestBed.configureTestingModule({
      providers: [{ provide: CLOCK, useValue: { now: () => new Date('2026-11-21T10:00:00Z') } }],
    });
    const fixture = TestBed.createComponent(ManagerFormComponent);
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('mode', mode);
    fixture.componentRef.setInput('heading', 'Add a manager');
    fixture.componentRef.setInput('saving', saving);
    fixture.componentRef.setInput('pasteUid', invite.pasteUid ?? false);
    fixture.componentRef.setInput('inviteProblem', invite.problem ?? '');
    form.controls.uid.setValue(invite.uid ?? '');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, form, component: fixture.componentInstance, element };
  }

  it('should ask for their email alone, with three choices for every page (0030)', () => {
    const { element } = render();
    const first = element.querySelector('.mf-row');

    expect(element.querySelector('h2')?.textContent).toBe('Add a manager');
    expect(element.querySelector('.mf-lead')?.textContent).toContain('email them a link');
    expect(element.querySelector('input[formControlName="uid"]')).toBeNull();
    expect(element.querySelectorAll('.mf-row')).toHaveLength(24);
    expect(first?.getAttribute('role')).toBe('radiogroup');
    expect(first?.querySelectorAll('input[type="radio"]')).toHaveLength(3);
    expect(first?.querySelector('input:checked')?.closest('label')?.textContent.trim()).toBe(
      'Needs approval',
    );
    expect(
      element.querySelector<HTMLInputElement>('input[formControlName="uploads"]')?.checked,
    ).toBe(true);
    expect(element.querySelector('button[type="submit"]')?.textContent.trim()).toBe(
      'Create and invite',
    );
  });

  it('should show the id as text, not a box, when changing a manager', () => {
    const { element } = render(RoleFormMode.Editing, false, { uid: 'manager-uid' });

    expect(element.querySelector('.mf-lead')).toBeNull();
    expect(element.querySelector('code')?.textContent).toBe('manager-uid');
    expect(element.querySelector('.mf-paste')).toBeNull();
  });

  it('should ask for the id when pasting it, and say why the account couldn’t be made', () => {
    const { element } = render(RoleFormMode.Adding, false, {
      pasteUid: true,
      problem: 'This email already has an account.',
    });

    expect(element.querySelector('input[formControlName="uid"]')).not.toBeNull();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('already has');
    expect(element.querySelector('button[type="submit"]')?.textContent.trim()).toBe('Save');
  });

  it('should pass on the paste switch and Set all', () => {
    const { component, element } = render();
    const pasted: boolean[] = [];
    const set: string[] = [];
    component.pasteUidChanged.subscribe((on) => pasted.push(on));
    component.allSet.subscribe((access) => set.push(access));

    element.querySelector<HTMLInputElement>('.mf-paste input')?.click();
    element.querySelector<HTMLButtonElement>('.mf-chip:last-of-type')?.click();

    expect(pasted).toEqual([true]);
    expect(set).toEqual(['publish']);
  });

  it('should explain what to fix once a field was left', () => {
    const { fixture, form, element } = render(RoleFormMode.Adding, false, { pasteUid: true });

    form.controls.uid.setValue('has space');
    form.controls.uid.markAsTouched();
    form.controls.email.markAsTouched();
    fixture.detectChanges();

    expect(element.querySelector('#mf-uid-error')?.textContent).toContain('User UID');
    expect(element.querySelector('#mf-email-error')?.textContent).toBe('Fill this in.');
    expect(
      element.querySelector('input[formControlName="uid"]')?.getAttribute('aria-invalid'),
    ).toBe('true');
  });

  it('should ask to save, or to close', () => {
    const { component, element } = render();
    const submitted = vi.fn();
    const cancelled = vi.fn();
    component.submitted.subscribe(submitted);
    component.cancelled.subscribe(cancelled);

    element.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    Array.from(element.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent.trim() === 'Cancel')
      ?.click();

    expect(submitted).toHaveBeenCalled();
    expect(cancelled).toHaveBeenCalled();
  });

  it.each([
    [false, 'Inviting…'],
    [true, 'Saving…'],
  ])('should show that it is working, pasting the id: %s', (pasteUid, label) => {
    const { element } = render(RoleFormMode.Adding, true, { pasteUid });
    const save = element.querySelector<HTMLButtonElement>('button[type="submit"]');

    expect(save?.textContent.trim()).toBe(label);
    expect(save?.disabled).toBe(true);
  });

  it('should offer the owner’s areas, all off, saying what Leads shows', () => {
    const { element } = render();
    const switches = Array.from(
      element.querySelectorAll<HTMLInputElement>('fieldset[formGroupName="areas"] input'),
    );

    expect(switches).toHaveLength(4);
    expect(switches.every((input) => !input.checked)).toBe(true);
    expect(element.textContent).toContain('names, phone numbers and emails');
  });

  it('should offer approving their own changes, off by default (0023)', () => {
    const { element } = render();
    const approve = Array.from(
      element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
    ).find((input) =>
      input.closest('label')?.textContent.includes('Can approve their own changes'),
    );

    expect(approve?.checked).toBe(false);
  });

  /** Ticks the super manager switch as the owner does, by clicking it. */
  function turnSuperOn(element: HTMLElement): void {
    element.querySelector<HTMLInputElement>('input[formControlName="superManager"]')?.click();
  }

  it('should offer for good or until a day once the super manager switch is on (0024)', () => {
    const { fixture, element } = render();
    expect(element.querySelector('.mf-term')).toBeNull();

    turnSuperOn(element);
    fixture.detectChanges();

    expect(element.querySelectorAll('.mf-term input[type="radio"]')).toHaveLength(2);
    expect(element.querySelector<HTMLInputElement>('input[type="date"]')?.min).toBe('2026-11-21');
  });

  it('should say what to fix in a past day, and hide the day for good', () => {
    const { fixture, element } = render();
    turnSuperOn(element);
    fixture.detectChanges();
    const day = element.querySelector<HTMLInputElement>('input[type="date"]');
    if (day) {
      day.value = '2026-11-01';
      day.dispatchEvent(new Event('input'));
      day.dispatchEvent(new Event('blur'));
    }
    fixture.detectChanges();

    expect(element.querySelector('#mf-until-error')?.textContent).toBe(
      'Choose today or a later day.',
    );
    element.querySelector<HTMLInputElement>('.mf-term input[type="radio"]')?.click();
    fixture.detectChanges();

    expect(element.querySelector('input[type="date"]')).toBeNull();
  });
});
