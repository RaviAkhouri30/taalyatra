import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// bootstrapApplication() returns a Promise by framework design; this entry point is the only
// place outside SDK adapters where one is handled (CLAUDE.md §7).
bootstrapApplication(App, appConfig).catch((error: unknown) => {
  console.error(error);
});
