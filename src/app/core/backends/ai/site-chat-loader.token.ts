import { HttpClient } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { type Observable, defer, map } from 'rxjs';
import { BackendType } from '@core/enums/backend-type.enum';
import { type ISiteChat } from '@core/interfaces/i-site-chat';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';

/** Loads the site's AI chat (0025 V7) as its own chunk. */
export type SiteChatLoader = () => Observable<ISiteChat>;

/**
 * A token, so the chat's specs can swap in their own; beside the adapters because the dynamic
 * imports must stay inside `core/backends`. A factory, so it picks the adapter: the Azure Function
 * for a Firebase build, the Fake otherwise (development and e2e).
 */
export const SITE_CHAT_LOADER = new InjectionToken<SiteChatLoader>('SITE_CHAT_LOADER', {
  providedIn: 'root',
  factory: () => {
    const http = inject(HttpClient);
    const environment = inject(APP_ENVIRONMENT);
    // The dynamic imports are Promises; defer() keeps them lazy and inside core/backends (§7).
    return () =>
      environment.backend === BackendType.Firebase
        ? defer(() => import('./http-site-chat')).pipe(map((chunk) => new chunk.HttpSiteChat(http)))
        : defer(() => import('../fake/fake-site-chat')).pipe(
            map((chunk) => new chunk.FakeSiteChat(environment.fakeLatencyMs)),
          );
  },
});
