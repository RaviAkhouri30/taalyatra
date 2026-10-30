import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { type DocumentWrite } from '@core/interfaces/i-document-store';
import { FirebaseDocumentStore, FirestoreUnavailableError } from './firebase-document-store';
import { FirestoreConnection } from './firestore-connection.service';

describe('FirebaseDocumentStore', () => {
  const gateway = {
    getDocument: vi.fn(),
    getCollectionDocuments: vi.fn(),
    commit: vi.fn(),
  };

  function create(connected = true): FirebaseDocumentStore {
    TestBed.configureTestingModule({
      providers: [
        { provide: FirestoreConnection, useValue: { gateway$: connected ? of(gateway) : null } },
      ],
    });
    return TestBed.runInInjectionContext(() => new FirebaseDocumentStore());
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should read a document fresh, putting a list section back in its envelope', async () => {
    gateway.getDocument.mockReturnValue(of(['Drum Circle']));

    await expect(firstValueFrom(create().read('home/marquee'))).resolves.toEqual({
      _items: ['Drum Circle'],
    });
    expect(gateway.getDocument).toHaveBeenCalledWith('home/marquee');
  });

  it('should answer null for a missing document', async () => {
    gateway.getDocument.mockReturnValue(of(undefined));

    await expect(firstValueFrom(create().read('drafts/home__hero'))).resolves.toBeNull();
  });

  it('should read every document in a collection by id', async () => {
    gateway.getCollectionDocuments.mockReturnValue(
      of(new Map([['home__hero', { path: 'home/hero' }]])),
    );

    const drafts = await firstValueFrom(create().readAll('drafts'));

    expect(drafts.get('home__hero')).toEqual({ path: 'home/hero' });
  });

  it('should hand every write to one gateway batch', async () => {
    gateway.commit.mockReturnValue(of(undefined));
    const writes: DocumentWrite[] = [{ kind: DocumentWriteKind.Delete, path: 'drafts/x' }];

    await firstValueFrom(create().commit(writes), { defaultValue: undefined });

    expect(gateway.commit).toHaveBeenCalledWith(writes);
  });

  it('should fail with a clear error when Firebase is not configured', async () => {
    await expect(firstValueFrom(create(false).read('home/hero'))).rejects.toBeInstanceOf(
      FirestoreUnavailableError,
    );
  });
});
