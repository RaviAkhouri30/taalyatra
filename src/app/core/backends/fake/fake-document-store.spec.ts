import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { LocalStoreService } from '@core/services/local-store.service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { FakeDataStore } from './fake-data-store.service';
import { FakeDocumentStore } from './fake-document-store';

describe('FakeDocumentStore', () => {
  function create(): FakeDocumentStore {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_ENVIRONMENT, useValue: { ...environment, fakeLatencyMs: 0 } },
        // Nothing saved from earlier visits, and nothing kept for later ones.
        { provide: LocalStoreService, useValue: { get: () => null, set: () => undefined } },
      ],
    });
    return TestBed.runInInjectionContext(() => new FakeDocumentStore());
  }

  it('should read a list section in its stored envelope, as Firestore keeps it', async () => {
    const marquee = await firstValueFrom(create().read('home/marquee'));

    expect(marquee).toHaveProperty('_items');
  });

  it('should answer null for a missing document', async () => {
    await expect(firstValueFrom(create().read('drafts/home__hero'))).resolves.toBeNull();
  });

  it('should write nothing until the commit is subscribed, then everything', async () => {
    const store = create();
    const commit = store.commit([
      { kind: DocumentWriteKind.Set, path: 'drafts/home__hero', fields: { path: 'home/hero' } },
    ]);

    await expect(firstValueFrom(store.readAll('drafts'))).resolves.toEqual(new Map());
    await firstValueFrom(commit, { defaultValue: undefined });

    await expect(firstValueFrom(store.readAll('drafts'))).resolves.toEqual(
      new Map([['home__hero', { path: 'home/hero' }]]),
    );
  });

  it('should share its writes with the Fake backend', async () => {
    const store = create();

    await firstValueFrom(
      store.commit([{ kind: DocumentWriteKind.Set, path: 'home/hero', fields: { title: 'X' } }]),
      { defaultValue: undefined },
    );

    await expect(firstValueFrom(TestBed.inject(FakeDataStore).read('home/hero'))).resolves.toEqual({
      title: 'X',
    });
  });
});
