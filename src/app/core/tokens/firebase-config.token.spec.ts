import { TestBed } from '@angular/core/testing';
import { RUNTIME_FIREBASE_CONFIG_KEY } from '@core/config/runtime-firebase-config';
import { environment } from '@env/environment';
import { APP_ENVIRONMENT } from './app-environment.token';
import { FIREBASE_CONFIG } from './firebase-config.token';

describe('FIREBASE_CONFIG', () => {
  const config = {
    apiKey: 'key',
    authDomain: 'taal-yatra.firebaseapp.com',
    projectId: 'taal-yatra',
    storageBucket: 'taal-yatra.firebasestorage.app',
    messagingSenderId: '123',
    appId: '1:123:web:abc',
  };

  afterEach(() => {
    Reflect.deleteProperty(globalThis, RUNTIME_FIREBASE_CONFIG_KEY);
  });

  function inject(firebase: typeof config | null): unknown {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_ENVIRONMENT, useValue: { ...environment, firebase } }],
    });
    return TestBed.inject(FIREBASE_CONFIG);
  }

  it('should use the build-time config when the environment sets one', () => {
    Reflect.set(globalThis, RUNTIME_FIREBASE_CONFIG_KEY, { ...config, projectId: 'other' });

    expect(inject(config)).toBe(config);
  });

  it('should fall back to runtime-config.js when the environment sets none', () => {
    Reflect.set(globalThis, RUNTIME_FIREBASE_CONFIG_KEY, config);

    expect(inject(null)).toBe(config);
  });

  it('should be null when neither source provides a config', () => {
    expect(inject(null)).toBeNull();
  });
});
