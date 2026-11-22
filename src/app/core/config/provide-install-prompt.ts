import { type Provider } from '@angular/core';
import { BrowserInstallPrompt } from '@core/backends/browser/browser-install-prompt';
import { IInstallPrompt } from '@core/interfaces/i-install-prompt';

/** @returns The `IInstallPrompt` port's provider (0026), for the admin routes only. */
export function provideInstallPrompt(): Provider {
  return { provide: IInstallPrompt, useFactory: () => new BrowserInstallPrompt() };
}
