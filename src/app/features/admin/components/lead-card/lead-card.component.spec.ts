import { TestBed } from '@angular/core/testing';
import { Lead, LeadStatus } from '../../models/lead.model';
import { LeadCardComponent } from './lead-card.component';

describe('LeadCardComponent', () => {
  const lead = new Lead('a', {
    name: 'Asha',
    phone: '98200 12345',
    email: 'asha@example.com',
    eventType: 'Corporate',
    groupSize: '50–100',
    message: 'Hello',
    status: 'contacted',
  });

  function render(confirming = false) {
    const fixture = TestBed.createComponent(LeadCardComponent);
    fixture.componentRef.setInput('lead', lead);
    fixture.componentRef.setInput('confirming', confirming);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { component: fixture.componentInstance, element };
  }

  it('should show who it is, how to reach them, and what they asked for', () => {
    const { element } = render();
    const links = Array.from(element.querySelectorAll('.lc-contact a')).map((link) =>
      link.getAttribute('href'),
    );

    expect(element.querySelector('h2')?.textContent).toBe('Asha');
    expect(links).toEqual([
      'tel:+919820012345',
      'https://wa.me/919820012345',
      'mailto:asha@example.com',
    ]);
    expect(element.querySelector('.lc-details')?.textContent).toContain('Corporate');
    expect(element.querySelector('.lc-message')?.textContent).toBe('Hello');
    expect(element.querySelector('select')?.value).toBe('contacted');
  });

  it('should pass on a new status', () => {
    const { component, element } = render();
    const changed = vi.fn();
    component.statusChanged.subscribe(changed);
    const select = element.querySelector('select')!;

    select.value = 'won';
    select.dispatchEvent(new Event('change'));

    expect(changed).toHaveBeenCalledWith(LeadStatus.Won);
  });

  it('should ask to remove, and confirm or cancel', () => {
    const asked = render();
    const ask = vi.fn();
    asked.component.removeAsked.subscribe(ask);
    asked.element.querySelector<HTMLButtonElement>('.lc-foot button')!.click();
    expect(ask).toHaveBeenCalled();

    TestBed.resetTestingModule();
    const { component, element } = render(true);
    const confirm = vi.fn();
    const cancel = vi.fn();
    component.removeConfirmed.subscribe(confirm);
    component.removeCancelled.subscribe(cancel);
    const [yes, no] = Array.from(element.querySelectorAll<HTMLButtonElement>('.lc-confirm button'));

    expect(element.querySelector('.lc-confirm p')?.textContent).toContain(
      'Asha’s details for good',
    );
    yes!.click();
    no!.click();
    expect(confirm).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalled();
  });

  it('should leave Remove out and say who changed the status when shown to a manager', () => {
    const fixture = TestBed.createComponent(LeadCardComponent);
    fixture.componentRef.setInput(
      'lead',
      new Lead('a', { name: 'Asha', status: 'won', statusBy: 'm@b.c', statusAt: '' }),
    );
    fixture.componentRef.setInput('canRemove', false);
    fixture.componentRef.setInput('viewer', 'm@b.c');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).not.toContain('Remove');
    expect(element.querySelector('.lc-by')?.textContent).toBe('Won by you');
  });
});
