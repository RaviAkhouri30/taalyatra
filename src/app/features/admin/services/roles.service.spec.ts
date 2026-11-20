import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { EditorTab } from '../models/editor-tab.enum';
import { PageAccess } from '../models/role.model';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  const stored = (email: string) => ({
    email,
    pages: { hero: 'publish' },
    uploads: true,
    addedAt: '2026-11-19T10:00:00.000Z',
  });

  function setUp(seed: Record<string, Record<string, unknown>> = {}) {
    const store = new MemoryDocumentStore(seed);
    TestBed.configureTestingModule({ providers: [{ provide: IDocumentStore, useValue: store }] });
    return { service: TestBed.inject(RolesService), store };
  }

  it('should list the managers by email, leaving out damaged records', async () => {
    const { service } = setUp({
      'roles/b': stored('zara@b.c'),
      'roles/a': stored('asha@b.c'),
      'roles/bad': { pages: {} },
    });

    const managers = await firstValueFrom(service.managers());

    expect(managers.map((manager) => manager.uid)).toEqual(['a', 'b']);
    expect(managers[0]?.role.pages.get(EditorTab.Hero)).toBe(PageAccess.Publish);
  });

  it('should store a manager in the shape the rules accept', async () => {
    const { service, store } = setUp();
    const role = {
      email: 'm@b.c',
      pages: new Map([[EditorTab.Team, PageAccess.Hidden]]),
      uploads: false,
      addedAt: '2026-11-19T10:00:00.000Z',
    };

    const saved = await firstValueFrom(service.save('manager-uid', role));

    expect(saved).toEqual({ uid: 'manager-uid', role });
    expect(store.documents.get('roles/manager-uid')).toEqual({
      email: 'm@b.c',
      pages: { team: 'hidden' },
      uploads: false,
      areas: { leads: false, visits: false, backups: false, goingBack: false },
      addedAt: '2026-11-19T10:00:00.000Z',
    });
  });

  it('should remove a manager’s record', async () => {
    const { service, store } = setUp({ 'roles/manager-uid': stored('m@b.c') });

    await firstValueFrom(service.remove('manager-uid'));

    expect(store.documents.has('roles/manager-uid')).toBe(false);
  });
});
