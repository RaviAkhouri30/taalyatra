import {
  RUNTIME_FIREBASE_CONFIG_KEY,
  isFirebaseConfig,
  readRuntimeFirebaseConfig,
} from './runtime-firebase-config';

describe('runtime Firebase config', () => {
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

  it('should accept a config when every setting is a non-empty string', () => {
    expect(isFirebaseConfig(config)).toBe(true);
  });

  it.each([
    ['a setting is missing', { ...config, appId: undefined }],
    ['a setting is empty', { ...config, apiKey: '' }],
    ['a setting is not a string', { ...config, projectId: 42 }],
    ['the value is null', null],
    ['the value is a string', 'taal-yatra'],
  ])('should reject the value when %s', (_case, value) => {
    expect(isFirebaseConfig(value)).toBe(false);
  });

  it('should read the config from the given source when runtime-config.js set it', () => {
    expect(readRuntimeFirebaseConfig({ [RUNTIME_FIREBASE_CONFIG_KEY]: config })).toBe(config);
  });

  it('should read globalThis when no source is given', () => {
    Reflect.set(globalThis, RUNTIME_FIREBASE_CONFIG_KEY, config);

    expect(readRuntimeFirebaseConfig()).toBe(config);
  });

  it('should return null when runtime-config.js is missing or incomplete', () => {
    expect(readRuntimeFirebaseConfig({})).toBeNull();
    expect(
      readRuntimeFirebaseConfig({ [RUNTIME_FIREBASE_CONFIG_KEY]: { apiKey: 'key' } }),
    ).toBeNull();
  });
});
