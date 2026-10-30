import { Service, inject } from '@angular/core';
import { type Observable, shareReplay } from 'rxjs';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { FIREBASE_CONFIG } from '@core/tokens/firebase-config.token';
import { FIRESTORE_GATEWAY_LOADER } from './firestore-gateway-loader.token';
import { type IFirestoreGateway } from './i-firestore-gateway';

/**
 * The one Firestore gateway every Firebase adapter shares, loaded on first use. A second gateway
 * would connect the emulator a second time, which the SDK rejects once the instance is in use.
 */
@Service()
export class FirestoreConnection {
  /** The gateway, loaded once; `null` when no Firebase config is available. */
  public readonly gateway$: Observable<IFirestoreGateway> | null;

  public constructor() {
    const config = inject(FIREBASE_CONFIG);
    const load = inject(FIRESTORE_GATEWAY_LOADER);
    const emulator = inject(APP_ENVIRONMENT).firestoreEmulator;
    // refCount: false keeps the loaded chunk and its Firestore instance for the whole visit.
    this.gateway$ =
      config === null
        ? null
        : load(config, emulator).pipe(shareReplay({ bufferSize: 1, refCount: false }));
  }
}
