import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FakeAiService } from '@core/backends/fake/fake-ai.service';
import { IAiService } from '@core/interfaces/i-ai-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { type AbstractControl } from '@angular/forms';
import { buildControl } from '../../forms/schema-control.factory';
import { FieldKind } from '../../models/field-kind.enum';
import { type FieldSchema } from '../../models/i-field-schema';
import { provideEditorTesting, provideNoAi } from '../../testing/editor-testing';
import { SchemaFieldComponent } from './schema-field.component';

// The fields' AI help needs a route and the AI port; none is set up here (0025).
beforeEach(() => {
  TestBed.configureTestingModule({ providers: [provideRouter([]), provideNoAi()] });
});

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

  it('should show the counter only near the limit', () => {
    const { fixture, element } = render(
      { key: 'title', label: 'Title', kind: FieldKind.Text, maxLength: 40, recommended: 20 },
      'Hello',
    );

    // As typed: an input event, which is what refreshes the field.
    const input = element.querySelector('input')!;
    input.value = 'x'.repeat(16);
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(element.querySelector('#f-count')?.textContent.trim()).toBe('16 / 20 characters');
  });

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
    expect(input.getAttribute('aria-describedby')).toBe('f-hint f-count f-note f-error');
    // 5 of 20: far from the limit, so the counter stays quiet (0017 U5).
    expect(element.querySelector('#f-count')?.textContent.trim()).toBe('');
  });

  it('should show an image field with its error tied to it', () => {
    TestBed.configureTestingModule({ providers: [provideEditorTesting().providers] });
    const { element } = render(
      { key: 'photo', label: 'Photo', kind: FieldKind.Image, aspect: 1 },
      undefined,
    );

    expect(element.querySelector('app-image-field')).not.toBeNull();
    expect(element.querySelector('textarea')?.getAttribute('aria-describedby')).toBe(
      'f-note f-error',
    );
    expect(element.querySelector('#f-error')?.textContent).toBe('Choose a photo.');
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

  it('should mark a required field, and leave others alone', () => {
    const required = render(
      { key: 'title', label: 'Title', kind: FieldKind.Text, required: true },
      'Hello',
    ).element;

    expect(required.querySelector('label')?.classList).toContain('fd-label--required');
    expect(required.querySelector('input')?.getAttribute('aria-required')).toBe('true');
  });

  it('should not mark an optional field', () => {
    const { element } = render({ key: 'lead', label: 'Lead', kind: FieldKind.Multiline }, 'Hi');

    expect(element.querySelector('label')?.classList).not.toContain('fd-label--required');
    expect(element.querySelector('textarea')?.getAttribute('aria-required')).toBe('false');
  });

  it('should flag a placeholder at the field, and drop it once replaced', async () => {
    const { fixture, control, element } = render(
      { key: 'name', label: 'Name', kind: FieldKind.Text },
      '[NAME]',
    );
    expect(element.querySelector('#f-note')?.textContent).toContain('[NAME]');

    control.setValue('Asha');
    fixture.componentInstance.control.set(control);
    (fixture.nativeElement as HTMLElement)
      .querySelector('input')
      ?.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(element.querySelector('#f-note')?.textContent).toBe('');
  });

  it('should leave an ordinary switch alone when it changes', () => {
    const { control, element } = render(
      { key: 'live', label: 'Live', kind: FieldKind.Toggle },
      true,
    );

    element.querySelector('input')?.click();

    expect(control.value).toBe(false);
  });

  describe('with AI help set up (0025, 0029)', () => {
    beforeEach(() => {
      // jsdom has no layout: the menu and suggestion scroll themselves into view.
      Element.prototype.scrollIntoView = vi.fn();
      TestBed.configureTestingModule({
        providers: [
          { provide: IAiService, useClass: FakeAiService },
          { provide: APP_ENVIRONMENT, useValue: { ...environment, fakeLatencyMs: 0 } },
        ],
      });
    });

    it.each([
      [FieldKind.Text, true],
      [FieldKind.Multiline, true],
      [FieldKind.Url, false],
      [FieldKind.Tel, false],
      [FieldKind.Email, false],
    ])('should offer it on a %s field: %s', (kind, offered) => {
      const { element } = render({ key: 'x', label: 'X', kind } as FieldSchema, 'value');

      expect(element.querySelector('app-ai-assist') !== null).toBe(offered);
    });

    it('should put a used suggestion in the field, ready to save', async () => {
      const { fixture, control, element } = render(
        { key: 'title', label: 'Title', kind: FieldKind.Text },
        'Drum',
      );
      const click = async (name: string) => {
        Array.from(element.querySelectorAll('button'))
          .find((button) => button.textContent.replace(/\s+/gu, ' ').trim().endsWith(name))
          ?.click();
        await new Promise((resolve) => {
          setTimeout(resolve);
        });
        fixture.detectChanges();
      };

      element.querySelector<HTMLButtonElement>('.aa-chip')?.click();
      fixture.detectChanges();
      await click('Shorter');
      await click('Use this');

      expect(control.value).toBe('shorter: Drum');
      expect(control.dirty).toBe(true);
    });
  });
});
