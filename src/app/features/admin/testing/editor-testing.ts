import {
  type EnvironmentProviders,
  type Provider,
  type WritableSignal,
  signal,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { EMPTY, Subject, of } from 'rxjs';
import { FakeFileService } from '@core/backends/fake/fake-file.service';
import { IAiService, NO_AI } from '@core/interfaces/i-ai-service';
import { FakeAccountService } from '@core/backends/fake/fake-account.service';
import { IAccountService } from '@core/interfaces/i-account-service';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { type DocumentFields, IDocumentStore } from '@core/interfaces/i-document-store';
import { IFileService } from '@core/interfaces/i-file-service';
import { BackupService } from '../services/backup.service';
import { SavedThemesService } from '../services/saved-themes.service';
import { DeviceStoreService } from '../services/device-store.service';
import { LoggerService } from '@core/services/logger.service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { CLOCK } from '@core/tokens/clock.token';
import { environment } from '@env/environment';
import { provideFakeContent, provideSiteConfig } from '@shared/testing/fixtures';
import { SaveStatus } from '../models/save-status.enum';
import { EditorNavService } from '../services/editor-nav.service';
import { EditorLayoutViewModel } from '../view-models/editor-layout.view-model';
import { MemoryDocumentStore } from './memory-document-store';

/** The moment editor specs run at: 31 Oct 2026, 3:30 pm in Pune. */
export const EDITOR_NOW = new Date('2026-10-31T10:00:00.000Z');

/** The signed-in owner in editor specs (the environment's owner id is theirs). */
export const EDITOR_ADMIN = { uid: 'admin-uid', email: 'owner@example.com' };

/**
 * @param user The signed-in account; the owner unless a spec signs in a manager.
 * @returns Providers for a signed-in account, with the environment's owner id the owner's.
 */
export function provideSignedIn(user: { uid: string; email: string } = EDITOR_ADMIN): Provider[] {
  return [
    { provide: IAuthService, useValue: { user$: of(user), signOut: vi.fn(() => of(undefined)) } },
    { provide: APP_ENVIRONMENT, useValue: { ...environment, adminUid: EDITOR_ADMIN.uid } },
  ];
}

/**
 * @param seed Stored documents to start with, by path.
 * @returns Providers for editor specs (fake content, an in-memory store, a fixed clock, a
 *   signed-in admin, fake files and browser storage) and the fakes, to inspect.
 */
export function provideEditorTesting(seed: Readonly<Record<string, DocumentFields>> = {}): {
  providers: (Provider | EnvironmentProviders)[];
  store: MemoryDocumentStore;
  signOut: ReturnType<typeof vi.fn>;
  files: FakeFileService;
  localStore: IMemoryLocalStore;
} {
  const store = new MemoryDocumentStore(seed);
  const signOut = vi.fn(() => of(undefined));
  const files = new FakeFileService();
  const localStore = memoryLocalStore();
  return {
    store,
    signOut,
    files,
    localStore,
    providers: [
      provideRouter([]),
      provideNoAi(),
      provideFakeContent().provider,
      provideSiteConfig(),
      { provide: LoggerService, useValue: { error: vi.fn() } },
      { provide: IDocumentStore, useValue: store },
      { provide: CLOCK, useValue: { now: () => EDITOR_NOW } },
      { provide: IAuthService, useValue: { user$: of(EDITOR_ADMIN), signOut } },
      { provide: APP_ENVIRONMENT, useValue: { ...environment, adminUid: EDITOR_ADMIN.uid } },
      { provide: IFileService, useValue: files },
      // Team access makes managers' accounts (0030).
      { provide: IAccountService, useFactory: () => new FakeAccountService() },
      BackupService,
      SavedThemesService,
      { provide: DeviceStoreService, useValue: localStore },
    ],
  };
}

/**
 * @returns An `IAiService` with no help set up (0025), as before the provider's settings are in
 *   place: fields show no AI buttons, so specs written before the AI help are unaffected.
 */
export function provideNoAi(): Provider {
  return {
    provide: IAiService,
    useValue: { status: () => of(NO_AI), write: () => EMPTY, analyseLeads: () => EMPTY },
  };
}

/** A stand-in for the editor layout, which pages report their saves to. */
export interface ILayoutStub {
  readonly reportSaving: ReturnType<typeof vi.fn>;
  readonly reportSaved: ReturnType<typeof vi.fn>;
  readonly reportFailed: ReturnType<typeof vi.fn>;
  readonly refreshChanges: ReturnType<typeof vi.fn>;
  readonly failed: WritableSignal<boolean>;
  readonly data: WritableSignal<unknown>;
  readonly retries$: Subject<void>;
  readonly changes$: Subject<void>;
  readonly contentResets$: Subject<void>;
  readonly status: WritableSignal<SaveStatus>;
  readonly retry: ReturnType<typeof vi.fn>;
  readonly resetContent: ReturnType<typeof vi.fn>;
  readonly markReleasesSeen: ReturnType<typeof vi.fn>;
}

/** @returns A fresh layout stand-in. */
export function layoutStub(): ILayoutStub {
  return {
    reportSaving: vi.fn(),
    reportSaved: vi.fn(),
    reportFailed: vi.fn(),
    refreshChanges: vi.fn(),
    failed: signal(false),
    data: signal<unknown>(undefined),
    retries$: new Subject<void>(),
    changes$: new Subject<void>(),
    contentResets$: new Subject<void>(),
    status: signal(SaveStatus.Idle),
    retry: vi.fn(),
    resetContent: vi.fn(),
    markReleasesSeen: vi.fn(),
  };
}

/**
 * @param stub The layout stand-in.
 * @returns A provider that puts it where pages look for the layout.
 */
export function provideLayout(stub: ILayoutStub): Provider {
  return [{ provide: EditorLayoutViewModel, useValue: stub }, EditorNavService];
}

/** A stand-in for `DeviceStoreService` that keeps values in memory. */
export interface IMemoryLocalStore {
  readonly values: Map<string, string>;
  get(key: string): string | null;
  set(key: string, value: string): boolean;
  remove(key: string): void;
}

/**
 * @param seed Values to start with, by key.
 * @returns A `DeviceStoreService` stand-in, so specs never touch the real browser storage.
 */
export function memoryLocalStore(seed: Readonly<Record<string, string>> = {}): IMemoryLocalStore {
  const values = new Map(Object.entries(seed));
  return {
    values,
    get: (key) => values.get(key) ?? null,
    set: (key, value) => values.set(key, value).has(key),
    remove: (key) => {
      values.delete(key);
    },
  };
}
