import { TestBed } from '@angular/core/testing';
import { createLeadFilterForm } from '../../forms/lead-filter-form';
import { LeadFiltersComponent } from './lead-filters.component';

describe('LeadFiltersComponent', () => {
  function render(filtering = false) {
    const form = createLeadFilterForm();
    const fixture = TestBed.createComponent(LeadFiltersComponent);
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('filtering', filtering);
    fixture.componentRef.setInput('options', {
      eventTypes: [{ value: 'Corporate', label: 'Corporate' }],
      groupSizes: [],
      months: [{ value: '2026-11', label: 'November 2026' }],
    });
    fixture.detectChanges();
    return {
      form,
      component: fixture.componentInstance,
      element: fixture.nativeElement as HTMLElement,
    };
  }

  it('should offer each filter’s choices, "Any" first', () => {
    const { element } = render();
    const [, events, , months] = Array.from(element.querySelectorAll('select'));

    expect(Array.from(events!.options).map((option) => option.text)).toEqual(['Any', 'Corporate']);
    expect(months?.options.item(1)?.text).toBe('November 2026');
  });

  it('should write what the owner types or picks into the form', () => {
    const { element, form } = render();
    const search = element.querySelector<HTMLInputElement>('input[type="search"]')!;
    const status = element.querySelector('select')!;

    search.value = 'Asha';
    search.dispatchEvent(new Event('input'));
    status.value = 'won';
    status.dispatchEvent(new Event('change'));

    expect(form.getRawValue()).toMatchObject({ search: 'Asha', status: 'won' });
  });

  it('should offer to clear the filters while one is set, and ask for every lead again', () => {
    const { component, element } = render(true);
    const cleared = vi.fn();
    component.cleared.subscribe(cleared);

    element.querySelector<HTMLButtonElement>('.lf-clear')?.click();

    expect(cleared).toHaveBeenCalled();
  });

  it('should offer no reset when no filter is set', () => {
    const { element } = render();

    expect(element.querySelector('.lf-clear')).toBeNull();
  });
});
