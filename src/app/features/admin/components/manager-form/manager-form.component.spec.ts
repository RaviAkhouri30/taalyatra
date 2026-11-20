import { TestBed } from '@angular/core/testing';
import { createRoleForm } from '../../forms/role-form';
import { RoleFormMode } from '../../models/team-access.model';
import { ManagerFormComponent } from './manager-form.component';

describe('ManagerFormComponent', () => {
  function render(mode = RoleFormMode.Adding, saving = false) {
    const form = createRoleForm('owner-uid', () => new Set());
    const fixture = TestBed.createComponent(ManagerFormComponent);
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('mode', mode);
    fixture.componentRef.setInput('heading', 'Add a manager');
    fixture.componentRef.setInput('saving', saving);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, form, component: fixture.componentInstance, element };
  }

  it('should show how to add a manager, and a setting for every page', () => {
    const { element } = render();

    expect(element.querySelector('h2')?.textContent).toBe('Add a manager');
    expect(element.querySelector('.mf-steps')?.textContent).toContain('User UID');
    expect(element.querySelectorAll('.mf-row select')).toHaveLength(15);
    expect(element.querySelector<HTMLSelectElement>('.mf-row select')?.value).toBe('approval');
    expect(element.querySelector<HTMLInputElement>('.mf-check input')?.checked).toBe(true);
  });

  it('should leave out the steps when changing a manager', () => {
    const { element } = render(RoleFormMode.Editing);

    expect(element.querySelector('.mf-steps')).toBeNull();
  });

  it('should explain what to fix once a field was left', () => {
    const { fixture, form, element } = render();

    form.controls.uid.setValue('has space');
    form.controls.uid.markAsTouched();
    form.controls.email.markAsTouched();
    fixture.detectChanges();

    expect(element.querySelector('#mf-uid-error')?.textContent).toContain('User UID');
    expect(element.querySelector('#mf-email-error')?.textContent).toBe('Fill this in.');
    expect(element.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('should ask to save, or to close', () => {
    const { component, element } = render();
    const submitted = vi.fn();
    const cancelled = vi.fn();
    component.submitted.subscribe(submitted);
    component.cancelled.subscribe(cancelled);

    element.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    element.querySelector<HTMLButtonElement>('button[type="button"]')?.click();

    expect(submitted).toHaveBeenCalled();
    expect(cancelled).toHaveBeenCalled();
  });

  it('should show that it is saving', () => {
    const { element } = render(RoleFormMode.Adding, true);
    const save = element.querySelector<HTMLButtonElement>('button[type="submit"]');

    expect(save?.textContent.trim()).toBe('Saving…');
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
});
