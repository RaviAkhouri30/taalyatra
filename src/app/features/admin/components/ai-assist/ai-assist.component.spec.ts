import { Component, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, of } from 'rxjs';
import { FAKE_AI_DESCRIPTION, FAKE_AI_FAIL } from '@core/backends/fake/fake-ai.constants';
import { FakeAiService } from '@core/backends/fake/fake-ai.service';
import { AiErrorKind } from '@core/enums/ai-error-kind.enum';
import { AI_ERROR_MESSAGES, IAiService, NO_AI } from '@core/interfaces/i-ai-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { CLOUDINARY_CONFIG } from '@core/tokens/cloudinary-config.token';
import { environment } from '@env/environment';
import { AiAssistMode } from '../../models/ai-assist';
import { AiAssistComponent } from './ai-assist.component';

const UPLOADED = 'v1/taal-yatra/media/abc';

/** A field wrapped in AI help, as `schema-field` wraps one. */
@Component({
  imports: [AiAssistComponent],
  template: `<app-ai-assist
    fieldId="headline"
    label="Headline"
    [mode]="mode()"
    [filled]="text().length > 0"
    [maxLength]="60"
    [text]="read"
    [imageSrc]="imageSrc()"
    (used)="text.set($event)"
    ><input id="headline"
  /></app-ai-assist>`,
})
class HostComponent {
  public readonly mode = input(AiAssistMode.Text);
  public readonly imageSrc = input('');
  public readonly text = signal('Drum with us');
  public readonly read = (): string => this.text();
}

describe('AiAssistComponent', () => {
  beforeEach(() => {
    // jsdom has no layout: the menu and suggestion scroll themselves into view.
    Element.prototype.scrollIntoView = vi.fn();
  });

  async function render(
    options: { text?: string; mode?: AiAssistMode; imageSrc?: string; ai?: unknown } = {},
  ) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: APP_ENVIRONMENT, useValue: { ...environment, fakeLatencyMs: 0 } },
        { provide: CLOUDINARY_CONFIG, useValue: { cloudName: 'demo' } },
        options.ai
          ? { provide: IAiService, useValue: options.ai }
          : { provide: IAiService, useClass: FakeAiService },
      ],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentRef.setInput('mode', options.mode ?? AiAssistMode.Text);
    fixture.componentRef.setInput('imageSrc', options.imageSrc ?? '');
    fixture.componentInstance.text.set(options.text ?? 'Drum with us');
    document.body.append(fixture.nativeElement as HTMLElement);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const settle = async () => {
      // The Fake answers after a timer (fakeLatencyMs 0), which whenStable doesn't wait for.
      await new Promise((resolve) => {
        setTimeout(resolve);
      });
      await fixture.whenStable();
    };
    const chip = () => element.querySelector<HTMLButtonElement>('.aa-chip');
    const button = (name: string) =>
      Array.from(element.querySelectorAll<HTMLButtonElement>('button')).find((each) =>
        each.textContent.replace(/\s+/gu, ' ').trim().endsWith(name),
      );
    const click = async (name: string) => {
      button(name)?.click();
      await settle();
    };
    const ask = async (choice: string) => {
      chip()?.click();
      await fixture.whenStable();
      await click(choice);
    };
    return {
      fixture,
      element,
      chip,
      button,
      click,
      ask,
      settle,
      text: fixture.componentInstance.text,
    };
  }

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('should keep the field inside, with a chip named for it in the corner', async () => {
    const { element, chip } = await render();

    expect(element.querySelector('.aa-frame input#headline')).not.toBeNull();
    expect(chip()?.getAttribute('aria-label')).toBe('AI help');
    expect(
      element.querySelector(`#${chip()?.getAttribute('aria-describedby') ?? ''}`)?.textContent,
    ).toBe('For Headline');
    expect(chip()?.getAttribute('aria-haspopup')).toBe('menu');
    expect(chip()?.textContent).toContain('Improve');
  });

  it('should offer the rewrites for a field with text', async () => {
    const { element, chip, fixture } = await render();

    chip()?.click();
    await fixture.whenStable();

    expect(chip()?.getAttribute('aria-expanded')).toBe('true');
    expect(element.querySelectorAll('[role="menuitem"]')).toHaveLength(5);
  });

  it('should offer a first version for an empty field', async () => {
    const { element, chip, fixture } = await render({ text: '' });
    expect(chip()?.textContent).toContain('Write');

    chip()?.click();
    await fixture.whenStable();

    expect(element.querySelector('[role="menuitem"]')?.textContent).toContain(
      'Write a first version',
    );
  });

  it.each([
    [{ key: 'j', ctrlKey: true }, 1],
    [{ key: 'j', metaKey: true }, 1],
    [{ key: 'j' }, 0],
  ])('should open the menu from the field with %o', async (init, menus) => {
    const { element, fixture } = await render();
    const event = new KeyboardEvent('keydown', { ...init, bubbles: true, cancelable: true });

    element.querySelector('input')?.dispatchEvent(event);
    await fixture.whenStable();

    expect(element.querySelectorAll('app-ai-menu')).toHaveLength(menus);
    expect(event.defaultPrevented).toBe(menus === 1);
  });

  it('should close the menu on Escape, back on the chip, and on a press elsewhere', async () => {
    const { element, chip, fixture } = await render();
    chip()?.click();
    await fixture.whenStable();

    element
      .querySelector('app-ai-menu')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(element.querySelector('app-ai-menu')).toBeNull();
    expect(document.activeElement).toBe(chip());
    chip()?.click();
    await fixture.whenStable();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await fixture.whenStable();

    expect(element.querySelector('app-ai-menu')).toBeNull();
  });

  it('should show the suggestion, and change the field only on Use this', async () => {
    const { element, ask, click, text } = await render();
    await ask('Warmer');

    expect(element.querySelector('.as-text')?.textContent).toBe('warmer: Drum with us');
    expect(element.querySelector('.as-yours s')?.textContent).toBe('Drum with us');
    expect(text()).toBe('Drum with us');
    await click('Use this');

    expect(text()).toBe('warmer: Drum with us');
    expect(element.querySelector('app-ai-suggestion')).toBeNull();
    expect(element.querySelector('.aa-frame--landed')).not.toBeNull();
  });

  it('should bring the owner’s text back with Undo', async () => {
    const { element, ask, click, text } = await render();
    await ask('Shorter');
    await click('Use this');

    await click('Undo');

    expect(text()).toBe('Drum with us');
    expect(element.querySelector('.aa-undo')).toBeNull();
  });

  it('should leave the field as it was on Discard', async () => {
    const { element, ask, click, text } = await render();
    await ask('Clearer');

    await click('Discard');

    expect(text()).toBe('Drum with us');
    expect(element.querySelector('app-ai-suggestion')).toBeNull();
  });

  it('should ring the field and shimmer while it writes', async () => {
    const ai = {
      status: () => of({ text: true, vision: false }),
      write: () => NEVER,
      analyseLeads: vi.fn(),
    };
    const { element, ask, chip } = await render({ ai });

    await ask('Clearer');

    expect(element.querySelector('.aa-frame--writing')).not.toBeNull();
    expect(chip()?.disabled).toBe(true);
    expect(element.querySelectorAll('.as-shim')).toHaveLength(2);
    expect(element.querySelector('[role="status"]')?.textContent.trim()).toBe('Writing…');
  });

  it('should say when the suggestion is ready, once', async () => {
    const { element, ask } = await render();

    await ask('Shorter');

    expect(element.querySelector('[role="status"]')?.textContent.trim()).toBe(
      'Suggestion ready: shorter: Drum with us',
    );
  });

  it('should say what went wrong, offer to try again, and leave the field alone', async () => {
    const { element, ask, button, text } = await render({ text: FAKE_AI_FAIL });

    await ask('Clearer');

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      AI_ERROR_MESSAGES[AiErrorKind.Unavailable],
    );
    expect(button('Try again')).toBeDefined();
    expect(text()).toBe(FAKE_AI_FAIL);
  });

  it('should describe an uploaded picture', async () => {
    const { element, chip, ask } = await render({
      mode: AiAssistMode.Picture,
      imageSrc: UPLOADED,
    });
    expect(chip()?.textContent).toContain('Describe');

    await ask('Describe the photo');

    expect(element.querySelector('.as-text')?.textContent).toBe(FAKE_AI_DESCRIPTION);
  });

  it('should send the picture’s Cloudinary address for a description', async () => {
    const ai = {
      status: () => of({ text: true, vision: true }),
      write: vi.fn(() => of('x')),
      analyseLeads: vi.fn(),
    };
    const { ask } = await render({ mode: AiAssistMode.Picture, imageSrc: UPLOADED, ai });

    await ask('Describe the photo');

    expect(ai.write).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800/${UPLOADED}`,
      }),
    );
  });

  it.each([
    ['a site picture that isn’t uploaded', '/images/home/hero.jpg'],
    ['no picture', ''],
  ])('should offer nothing for %s, keeping the field', async (_case, imageSrc) => {
    const { element, chip } = await render({ mode: AiAssistMode.Picture, imageSrc });

    expect(chip()).toBeNull();
    expect(element.querySelector('input#headline')).not.toBeNull();
  });

  it('should show only the field until the help is set up', async () => {
    const ai = { status: () => of(NO_AI), write: vi.fn(), analyseLeads: vi.fn() };
    const { element, chip } = await render({ ai });

    expect(chip()).toBeNull();
    expect(element.querySelector('app-ai-assist')?.classList.contains('aa--on')).toBe(false);
    expect(element.querySelector('input#headline')).not.toBeNull();
  });
});
