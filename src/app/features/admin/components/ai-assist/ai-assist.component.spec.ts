import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
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

describe('AiAssistComponent', () => {
  function render(
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
    const fixture = TestBed.createComponent(AiAssistComponent);
    let text = options.text ?? 'Drum with us';
    fixture.componentRef.setInput('fieldId', 'headline');
    fixture.componentRef.setInput('label', 'Headline');
    fixture.componentRef.setInput('maxLength', 60);
    fixture.componentRef.setInput('text', () => text);
    fixture.componentRef.setInput('mode', options.mode ?? AiAssistMode.Text);
    fixture.componentRef.setInput('imageSrc', options.imageSrc ?? '');
    const used: string[] = [];
    fixture.componentInstance.used.subscribe((value) => used.push(value));
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const buttons = () =>
      Array.from(element.querySelectorAll('button')).map((b) => b.textContent.trim());
    const click = async (name: string) => {
      Array.from(element.querySelectorAll('button'))
        .find((button) => button.textContent.trim() === name)
        ?.click();
      // The Fake answers after a timer (fakeLatencyMs 0), which whenStable doesn't wait for.
      await new Promise((resolve) => {
        setTimeout(resolve);
      });
      await fixture.whenStable();
      fixture.detectChanges();
    };
    return { fixture, element, buttons, click, used, setText: (value: string) => (text = value) };
  }

  it('should offer the rewrite styles for a field with text', async () => {
    const { element, buttons, click } = render();
    const toggle = element.querySelector('button');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');

    await click('AI help');

    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    expect(buttons()).toEqual([
      'AI help',
      'Clearer',
      'Shorter',
      'Warmer',
      'More formal',
      'Fix spelling and grammar',
    ]);
  });

  it('should offer a first version for an empty field', async () => {
    const { buttons, click } = render({ text: ' ' });

    await click('AI help');

    expect(buttons()).toEqual(['AI help', 'Suggest a first version']);
  });

  it('should show the suggestion, and hand it over only on Use it', async () => {
    const { element, click, used } = render();
    await click('AI help');
    await click('Warmer');

    expect(element.querySelector('.as-text')?.textContent).toBe('warmer: Drum with us');
    expect(used).toEqual([]);
    await click('Use it');

    expect(used).toEqual(['warmer: Drum with us']);
    expect(element.querySelector('app-ai-suggestion')).toBeNull();
  });

  it('should keep the owner’s text on Keep mine', async () => {
    const { element, click, used } = render();
    await click('AI help');
    await click('Clearer');

    await click('Keep mine');

    expect(used).toEqual([]);
    expect(element.querySelector('app-ai-suggestion')).toBeNull();
  });

  it('should say what went wrong, leaving the field alone', async () => {
    const { element, click, used } = render({ text: FAKE_AI_FAIL });
    await click('AI help');
    await click('Clearer');

    expect(element.querySelector('[role="alert"]')?.textContent).toBe(
      AI_ERROR_MESSAGES[AiErrorKind.Unavailable],
    );
    expect(used).toEqual([]);
  });

  it('should suggest a description for an uploaded picture', async () => {
    const { buttons, click, element } = render({ mode: AiAssistMode.Picture, imageSrc: UPLOADED });
    expect(buttons()).toEqual(['Suggest a description']);

    await click('Suggest a description');

    expect(element.querySelector('.as-text')?.textContent).toBe(FAKE_AI_DESCRIPTION);
  });

  it('should send the picture’s Cloudinary address for a description', async () => {
    const ai = {
      status: () => of({ text: true, vision: true }),
      write: vi.fn(() => of('x')),
      analyseLeads: vi.fn(),
    };
    const { click } = render({ mode: AiAssistMode.Picture, imageSrc: UPLOADED, ai });

    await click('Suggest a description');

    expect(ai.write).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800/${UPLOADED}`,
      }),
    );
  });

  it.each([
    ['a site picture that isn’t uploaded', AiAssistMode.Picture, '/images/home/hero.jpg'],
    ['no picture', AiAssistMode.Picture, ''],
  ])('should offer nothing for %s', (_case, mode, imageSrc) => {
    expect(render({ mode, imageSrc }).buttons()).toEqual([]);
  });

  it('should show nothing until the help is set up', () => {
    const ai = { status: () => of(NO_AI), write: vi.fn(), analyseLeads: vi.fn() };

    expect(render({ ai }).buttons()).toEqual([]);
  });
});
