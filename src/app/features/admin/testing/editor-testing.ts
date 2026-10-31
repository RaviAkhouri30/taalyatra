import {
  type EnvironmentProviders,
  type Provider,
  type WritableSignal,
  signal,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { type DocumentFields, IDocumentStore } from '@core/interfaces/i-document-store';
import { LoggerService } from '@core/services/logger.service';
import { CLOCK } from '@core/tokens/clock.token';
import { provideFakeContent, provideSiteConfig } from '@shared/testing/fixtures';
import { EditorLayoutViewModel } from '../view-models/editor-layout.view-model';
import { MemoryDocumentStore } from './memory-document-store';

/** The moment editor specs run at: 31 Oct 2026, 3:30 pm in Pune. */
export const EDITOR_NOW = new Date('2026-10-31T10:00:00.000Z');

/** The signed-in admin in editor specs. */
export const EDITOR_ADMIN = { uid: 'admin-uid', email: 'owner@example.com' };

/**
 * @param seed Stored documents to start with, by path.
 * @returns Providers for editor specs (fake content, an in-memory store, a fixed clock, a
 *   signed-in admin) and the store, to inspect.
 */
export function provideEditorTesting(seed: Readonly<Record<string, DocumentFields>> = {}): {
  providers: (Provider | EnvironmentProviders)[];
  store: MemoryDocumentStore;
  signOut: ReturnType<typeof vi.fn>;
} {
  const store = new MemoryDocumentStore(seed);
  const signOut = vi.fn(() => of(undefined));
  return {
    store,
    signOut,
    providers: [
      provideRouter([]),
      provideFakeContent().provider,
      provideSiteConfig(),
      { provide: LoggerService, useValue: { error: vi.fn() } },
      { provide: IDocumentStore, useValue: store },
      { provide: CLOCK, useValue: { now: () => EDITOR_NOW } },
      { provide: IAuthService, useValue: { user$: of(EDITOR_ADMIN), signOut } },
    ],
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
  };
}

/**
 * @param stub The layout stand-in.
 * @returns A provider that puts it where pages look for the layout.
 */
export function provideLayout(stub: ILayoutStub): Provider {
  return { provide: EditorLayoutViewModel, useValue: stub };
}
