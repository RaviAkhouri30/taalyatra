import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, toArray, take } from 'rxjs';
import { BrowserInstallPrompt } from './browser-install-prompt';

/** Chrome's offer, with the answer it will give. */
function offerEvent(outcome = 'accepted'): Event & { prompt: ReturnType<typeof vi.fn> } {
  const event = new Event('beforeinstallprompt', { cancelable: true });
  return Object.assign(event, {
    prompt: vi.fn(() => Promise.resolve()),
    userChoice: Promise.resolve({ outcome }),
  });
}

describe('BrowserInstallPrompt', () => {
  function create(): BrowserInstallPrompt {
    return TestBed.runInInjectionContext(() => new BrowserInstallPrompt());
  }

  it('should keep Chrome’s offer instead of its own bar, and say so', async () => {
    const prompt = create();
    const seen = firstValueFrom(prompt.offers().pipe(take(2), toArray()));
    const event = offerEvent();

    window.dispatchEvent(event);

    await expect(seen).resolves.toEqual([false, true]);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should show the kept offer once, and give the answer', async () => {
    const prompt = create();
    const subscription = prompt.offers().subscribe();
    const event = offerEvent('dismissed');
    window.dispatchEvent(event);

    await expect(firstValueFrom(prompt.install())).resolves.toBe(false);
    await expect(firstValueFrom(prompt.install())).resolves.toBe(false);
    expect(event.prompt).toHaveBeenCalledTimes(1);
    subscription.unsubscribe();
  });

  it('should accept, and forget the offer once the app is installed', async () => {
    const prompt = create();
    const seen: boolean[] = [];
    const subscription = prompt.offers().subscribe((available) => seen.push(available));
    window.dispatchEvent(offerEvent());

    await expect(firstValueFrom(prompt.install())).resolves.toBe(true);
    window.dispatchEvent(new Event('appinstalled'));

    expect(seen).toEqual([false, true, false]);
    subscription.unsubscribe();
  });

  it.each([
    ['running full screen', true, undefined, true],
    ['added to an iPhone’s home screen', false, true, true],
    ['in a browser tab', false, undefined, false],
  ])('should know when it’s %s', (_case, matches, standalone, installed) => {
    const view = {
      matchMedia: () => ({ matches }),
      navigator: { standalone },
      addEventListener: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { defaultView: view } }],
    });

    expect(create().isInstalledApp()).toBe(installed);
  });

  it('should offer nothing without a window', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { defaultView: null } }],
    });
    const prompt = create();

    await expect(firstValueFrom(prompt.offers())).resolves.toBe(false);
    expect(prompt.isInstalledApp()).toBe(false);
  });
});
