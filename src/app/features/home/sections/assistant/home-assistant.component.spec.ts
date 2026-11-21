import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SITE_CHAT_LOADER } from '@core/backends/ai/site-chat-loader.token';
import { SiteChatRole } from '@core/enums/site-chat-role.enum';
import { type ISiteChat } from '@core/interfaces/i-site-chat';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { OverlayStateService } from '@shared/services/overlay-state.service';
import { texts } from '@shared/testing/fixtures';
import { HOME, stubBackend } from '../../testing/home-fixtures';
import { HomeAssistantComponent } from './home-assistant.component';

/** A chat that can never answer: not turned on, a limit or offline. */
const NO_CHAT: ISiteChat = { ask: () => throwError(() => new Error('unavailable')) };

describe('HomeAssistantComponent', () => {
  /** No AI answer unless a test gives one: the script answers, as before 2.7.0. */
  function render(body: unknown = HOME.assistant, chat: ISiteChat = NO_CHAT) {
    const backend = stubBackend(body);
    TestBed.configureTestingModule({
      providers: [backend.provider, { provide: SITE_CHAT_LOADER, useValue: () => of(chat) }],
    });
    const fixture = TestBed.createComponent(HomeAssistantComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const toggle = () => element.querySelector<HTMLButtonElement>('.chatb')!;
    const panel = () => element.querySelector<HTMLElement>('.chat')!;
    const click = (target: HTMLElement) => {
      target.click();
      fixture.detectChanges();
    };
    const quick = (label: string) =>
      Array.from(element.querySelectorAll<HTMLButtonElement>('.qr button')).find(
        (button) => button.textContent.trim() === label,
      )!;
    const bubbles = () => texts(element, '.chat-b .m:not(.typing)');
    return { fixture, element, get: backend.get, toggle, panel, click, quick, bubbles };
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the closed cluster with the tease, badge and contact shortcuts', () => {
    const { element, get, toggle, panel } = render();

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeAssistant);
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(toggle().getAttribute('aria-controls')).toBe(panel().id);
    expect(panel().inert).toBe(true);
    expect(element.querySelector('.tease')?.textContent).toContain('Questions?');
    expect(element.querySelector('.badge')).not.toBeNull();
    expect(element.querySelector('.call')?.getAttribute('href')).toBe('tel:+919284276168');
    expect(element.querySelector('.wa')?.getAttribute('href')).toBe('https://wa.me/919284276168');
  });

  it('should open the panel with the greeting and hide the tease, badge and shortcuts', () => {
    const { element, toggle, panel, click, bubbles } = render();

    click(toggle());

    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(panel().classList).toContain('open');
    expect(panel().inert).toBe(false);
    expect(bubbles()).toEqual([HOME.assistant.greeting]);
    expect(element.querySelector('.tease')).toBeNull();
    expect(element.querySelector('.badge')).toBeNull();
    expect(element.querySelector('.call')?.getAttribute('tabindex')).toBe('-1');
    expect(element.querySelector('.wa')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should answer a quick question after a typing pause, newest first', () => {
    vi.useFakeTimers();
    const { element, fixture, toggle, click, quick, bubbles } = render();
    click(toggle());

    click(quick('Group size?'));

    expect(element.querySelector('.typing')).not.toBeNull();
    expect(bubbles()[0]).toBe('Group size?');
    vi.advanceTimersByTime(800);
    fixture.detectChanges();
    expect(element.querySelector('.typing')).toBeNull();
    expect(bubbles()[0]).toMatch(/^Drum Circle runs from 10/);
    expect(element.querySelector('.chat-b .m')?.classList).toContain('bot');
  });

  it('should send a typed question, clear the input and ignore blank ones', () => {
    vi.useFakeTimers();
    const { element, fixture, toggle, click, bubbles } = render();
    click(toggle());
    const input = element.querySelector<HTMLInputElement>('.chat-f input')!;
    const form = element.querySelector('form')!;

    input.value = '   ';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    input.value = 'How do I contact you?';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    vi.advanceTimersByTime(800);
    fixture.detectChanges();

    expect(input.value).toBe('');
    expect(bubbles()).toHaveLength(3);
    expect(bubbles()[0]).toContain('contact@taalyatra.in');
    expect(element.querySelector('.chat-b .me')?.textContent).toBe('How do I contact you?');
  });

  it('should keep only the latest eight messages on screen', () => {
    vi.useFakeTimers();
    const { fixture, toggle, click, quick, bubbles } = render();
    click(toggle());

    for (let round = 0; round < 5; round += 1) click(quick('Price?'));
    vi.advanceTimersByTime(800);
    fixture.detectChanges();

    expect(bubbles()).toHaveLength(8);
  });

  it('should close with Escape or the close button and return focus to the toggle', () => {
    const { element, toggle, panel, click } = render();
    click(toggle());

    panel().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    TestBed.tick();

    expect(panel().classList).not.toContain('open');
    expect(document.activeElement).toBe(toggle());

    click(toggle());
    click(element.querySelector<HTMLButtonElement>('.chat-h button')!);
    expect(panel().classList).not.toContain('open');
  });

  it('should ignore Escape while the panel is closed', () => {
    const { panel, toggle } = render();
    toggle().blur();

    panel().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(document.activeElement).not.toBe(toggle());
  });

  it('should tell other floating chrome while the panel is open, until destroyed', () => {
    const { fixture, toggle, click } = render();
    const overlay = TestBed.inject(OverlayStateService);

    click(toggle());
    expect(overlay.panelOpen()).toBe(true);
    click(toggle());
    expect(overlay.panelOpen()).toBe(false);

    click(toggle());
    fixture.destroy();
    expect(overlay.panelOpen()).toBe(false);
  });

  it('should render nothing until the assistant has loaded', () => {
    expect(render(null).element.querySelector('.fab')).toBeNull();
  });

  describe('the AI chat (0025 V7)', () => {
    function typeAndSend(element: HTMLElement, text: string): void {
      const input = element.querySelector<HTMLInputElement>('.chat-f input')!;
      input.value = text;
      input.dispatchEvent(new Event('input'));
      element.querySelector('form')!.dispatchEvent(new Event('submit'));
    }

    it('should answer a typed question from the AI, with the conversation before it', () => {
      const chat = { ask: vi.fn(() => of('It lasts two hours.')) };
      const { element, fixture, toggle, click, bubbles } = render(HOME.assistant, chat);
      click(toggle());

      typeAndSend(element, 'How long is it?');
      fixture.detectChanges();

      expect(bubbles()[0]).toBe('It lasts two hours.');
      expect(chat.ask).toHaveBeenCalledWith('How long is it?', []);
    });

    it('should send the last messages with a follow-up, as visitor and bot', () => {
      const chat = { ask: vi.fn(() => of('Yes.')) };
      const { element, fixture, toggle, click } = render(HOME.assistant, chat);
      click(toggle());
      typeAndSend(element, 'First?');
      fixture.detectChanges();

      typeAndSend(element, 'And then?');

      expect(chat.ask).toHaveBeenLastCalledWith('And then?', [
        { role: SiteChatRole.Visitor, text: 'First?' },
        { role: SiteChatRole.Bot, text: 'Yes.' },
      ]);
    });

    it('should keep quick replies scripted, even with the AI on', () => {
      vi.useFakeTimers();
      const chat = { ask: vi.fn(() => of('AI')) };
      const { fixture, toggle, click, quick, bubbles } = render(HOME.assistant, chat);
      click(toggle());

      click(quick('Group size?'));
      vi.advanceTimersByTime(800);
      fixture.detectChanges();

      expect(chat.ask).not.toHaveBeenCalled();
      expect(bubbles()[0]).toMatch(/^Drum Circle runs from 10/);
    });

    it('should say the AI may answer, and ask for no personal details', () => {
      const { element, toggle, click } = render();
      click(toggle());

      expect(element.querySelector('.chat-note')?.textContent).toContain(
        'Please don’t share personal details here.',
      );
    });
  });
});
