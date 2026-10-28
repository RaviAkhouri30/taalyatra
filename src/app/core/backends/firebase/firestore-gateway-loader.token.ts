import { InjectionToken } from '@angular/core';
import { defer, map } from 'rxjs';
import { type FirestoreGatewayLoader } from './i-firestore-gateway';

/**
 * Loads `firestore-gateway.ts` (the SDK) as its own chunk and creates the gateway. A token, so
 * adapter specs can swap in a fake gateway through DI; it lives beside the adapter because the
 * dynamic import must stay inside `core/backends`.
 */
export const FIRESTORE_GATEWAY_LOADER = new InjectionToken<FirestoreGatewayLoader>(
  'FIRESTORE_GATEWAY_LOADER',
  {
    providedIn: 'root',
    // The dynamic import is a Promise; defer() keeps it lazy and inside core/backends (§7).
    factory: () => (config, emulator) =>
      defer(() => import('./firestore-gateway')).pipe(
        map((chunk) => new chunk.FirestoreGateway(config, emulator)),
      ),
  },
);
