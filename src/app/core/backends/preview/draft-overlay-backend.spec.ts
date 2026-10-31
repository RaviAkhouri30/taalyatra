import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { type Observable, firstValueFrom, of, throwError } from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { type DocumentFields, IDocumentStore } from '@core/interfaces/i-document-store';
import { type IHttpBackend } from '@core/interfaces/i-http-backend';
import { DraftOverlayBackend } from './draft-overlay-backend';

describe('DraftOverlayBackend', () => {
  const live = { title: 'Live' };
  const inner = {
    get: vi.fn(() => of(new HttpResponse({ status: HttpStatusCode.Ok, body: live }))),
    post: vi.fn(() => of(new HttpResponse({ status: HttpStatusCode.Created }))),
    put: vi.fn(() => of(new HttpResponse({ status: HttpStatusCode.Ok }))),
    patch: vi.fn(() => of(new HttpResponse({ status: HttpStatusCode.Ok }))),
    delete: vi.fn(() => of(new HttpResponse({ status: HttpStatusCode.NoContent }))),
  };
  const drafts = new Map<string, DocumentFields>([
    ['home__hero', { path: 'home/hero', content: { title: 'Draft' }, savedAt: 'x' }],
    ['home__marquee', { path: 'home/marquee', content: { _items: ['Drum'] }, savedAt: 'x' }],
  ]);

  function create(
    user: { uid: string; email: string } | null,
    readAll: () => Observable<ReadonlyMap<string, DocumentFields>> = () => of(drafts),
  ) {
    const store = { readAll: vi.fn(readAll) };
    TestBed.configureTestingModule({
      providers: [
        { provide: IAuthService, useValue: { user$: of(user) } },
        { provide: IDocumentStore, useValue: store },
      ],
    });
    const backend = TestBed.runInInjectionContext(
      () => new DraftOverlayBackend(inner as unknown as IHttpBackend),
    );
    return { backend, store };
  }

  const admin = { uid: 'admin', email: 'owner@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should answer a drafted document from the draft for the signed-in owner', async () => {
    const { backend } = create(admin);

    const response = await firstValueFrom(backend.get('/home/hero'));

    expect(response.body).toEqual({ title: 'Draft' });
    expect(inner.get).not.toHaveBeenCalled();
  });

  it('should unwrap a drafted list section, as the real backend does', async () => {
    const { backend } = create(admin);

    await expect(firstValueFrom(backend.get('home/marquee'))).resolves.toMatchObject({
      body: ['Drum'],
    });
  });

  it('should pass documents without a draft to the real backend, reading drafts once', async () => {
    const { backend, store } = create(admin);

    await firstValueFrom(backend.get('home/faq'));
    await firstValueFrom(backend.get('home/team'));

    expect(inner.get).toHaveBeenCalledWith('home/faq');
    expect(store.readAll).toHaveBeenCalledTimes(1);
  });

  it('should show live content to anyone who is not signed in, without reading drafts', async () => {
    const { backend, store } = create(null);

    await expect(firstValueFrom(backend.get('home/hero'))).resolves.toMatchObject({ body: live });
    expect(store.readAll).not.toHaveBeenCalled();
  });

  it('should fall back to live content when the drafts cannot be read', async () => {
    const { backend } = create(admin, () => throwError(() => new Error('permission-denied')));

    await expect(firstValueFrom(backend.get('home/hero'))).resolves.toMatchObject({ body: live });
  });

  it('should pass every write straight to the real backend', async () => {
    const { backend } = create(admin);

    await firstValueFrom(backend.post('proposals', { name: 'A' }));
    await firstValueFrom(backend.put('x/y', {}));
    await firstValueFrom(backend.patch('x/y', {}));
    await firstValueFrom(backend.delete('x/y'));

    expect(inner.post).toHaveBeenCalledWith('proposals', { name: 'A' });
    expect(inner.put).toHaveBeenCalledWith('x/y', {});
    expect(inner.patch).toHaveBeenCalledWith('x/y', {});
    expect(inner.delete).toHaveBeenCalledWith('x/y');
  });
});
