import { InjectionToken } from '@angular/core';
import { defer, map } from 'rxjs';
import { type AuthGatewayLoader } from './i-auth-gateway';

/**
 * Loads `auth-gateway.ts` (the Auth SDK) as its own chunk and creates the gateway. A token, so
 * adapter specs can swap in a fake gateway through DI; beside the adapter because the dynamic
 * import must stay inside `core/backends`.
 */
export const AUTH_GATEWAY_LOADER = new InjectionToken<AuthGatewayLoader>('AUTH_GATEWAY_LOADER', {
  providedIn: 'root',
  // The dynamic import is a Promise; defer() keeps it lazy and inside core/backends (§7).
  factory: () => (config, emulator) =>
    defer(() => import('./auth-gateway')).pipe(
      map((chunk) => new chunk.AuthGateway(config, emulator)),
    ),
});
