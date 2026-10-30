import { TestBed } from '@angular/core/testing';
import { defer, firstValueFrom, of } from 'rxjs';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { FIREBASE_CONFIG } from '@core/tokens/firebase-config.token';
import { environment } from '@env/environment';
import { FirestoreConnection } from './firestore-connection.service';
import { FIRESTORE_GATEWAY_LOADER } from './firestore-gateway-loader.token';

describe('FirestoreConnection', () => {
  const config = { projectId: 'taal-yatra' };
  const emulator = { host: '127.0.0.1', port: 8080 };
  const gateway = { name: 'gateway' };

  function create(firebase: typeof config | null) {
    const loads = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_ENVIRONMENT, useValue: { ...environment, firestoreEmulator: emulator } },
        { provide: FIREBASE_CONFIG, useValue: firebase },
        {
          provide: FIRESTORE_GATEWAY_LOADER,
          useValue: (...args: unknown[]) =>
            defer(() => {
              loads(...args);
              return of(gateway);
            }),
        },
      ],
    });
    return { connection: TestBed.inject(FirestoreConnection), loads };
  }

  it('should load the gateway once with the config and emulator, however many adapters ask', async () => {
    const { connection, loads } = create(config);

    await firstValueFrom(connection.gateway$!);
    await firstValueFrom(connection.gateway$!);

    expect(loads).toHaveBeenCalledTimes(1);
    expect(loads).toHaveBeenCalledWith(config, emulator);
  });

  it('should have no gateway when Firebase is not configured', () => {
    expect(create(null).connection.gateway$).toBeNull();
  });
});
