import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type AbstractControl } from '@angular/forms';
import { buildControl } from '../../forms/schema-control.factory';
import { FieldKind } from '../../models/field-kind.enum';
import { type FieldSchema } from '../../models/i-field-schema';
import { SchemaFieldComponent } from './schema-field.component';

@Component({
  imports: [SchemaFieldComponent],
  template: '<app-schema-field [field]="field()" [control]="control()" fieldId="f" />',
})
class HostComponent {
  public readonly field = signal<FieldSchema>({ key: 'x', label: 'X', kind: FieldKind.Text });
  public readonly control = signal<AbstractControl | null>(null);
}

describe('SchemaFieldComponent', () => {
  function render(field: FieldSchema, value: unknown) {
    const fixture = TestBed.createComponent(HostComponent);
    const control = buildControl(field, value);
    fixture.componentInstance.field.set(field);
    fixture.componentInstance.control.set(control);
    fixture.detectChanges();
    return { fixture, control, element: fixture.nativeElement as HTMLElement };
  }

  it('should label a text field and tie its hint, counter and error to it', () => {
    const { element } = render(
      {
        key: 'title',
        label: 'Title',
        kind: FieldKind.Text,
        hint: 'Short.',
        maxLength: 40,
        recommended: 20,
      },
      'Hello',
    );
    const input = element.querySelector('input')!;

    expect(element.querySelector('label')?.getAttribute('for')).toBe('f');
    expect(input.getAttribute('aria-describedby')).toBe('f-hint f-count f-error');
    expect(element.querySelector('#f-count')?.textContent.trim()).toBe('5 / 20 characters');
  });

  it('should flag text longer than the writing tip, and explain an error', () => {
    const { fixture, control, element } = render(
      {
        key: 'title',
        label: 'Title',
        kind: FieldKind.Text,
        required: true,
        maxLength: 8,
        recommended: 4,
      },
      'Long one',
    );

    control.setValue('');
    fixture.detectChanges();
    expect(element.querySelector('#f-error')?.textContent).toBe('Fill this in.');
    expect(element.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
    control.setValue('Longer');
    fixture.detectChanges();

    expect(element.querySelector('.fd-count--over')).not.toBeNull();
  });

  it('should render a switch, a choice, a multi-line field and typed inputs', () => {
    expect(
      render({ key: 'on', label: 'On', kind: FieldKind.Toggle }, true).element.querySelector(
        '[role="switch"]',
      ),
    ).not.toBeNull();
    const choice = render(
      {
        key: 'theme',
        label: 'Theme',
        kind: FieldKind.Choice,
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ],
      },
      'b',
    ).element;
    expect(choice.querySelectorAll('option')).toHaveLength(2);
    expect(
      render({ key: 'lead', label: 'Lead', kind: FieldKind.Multiline }, '').element.querySelector(
        'textarea',
      ),
    ).not.toBeNull();
    expect(
      render({ key: 'd', label: 'Day', kind: FieldKind.Date }, null).element.querySelector('input')
        ?.type,
    ).toBe('date');
    expect(
      render(
        { key: 'n', label: 'Year', kind: FieldKind.Number, min: 1, max: 9 },
        3,
      ).element.querySelector('input')?.type,
    ).toBe('number');
  });

  it('should render nothing without a form control', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.fd')).toBeNull();
  });
});
