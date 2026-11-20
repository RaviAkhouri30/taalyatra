import { TestBed } from '@angular/core/testing';
import fakeDb from '@core/backends/fake/fake-db.json';
import {
  layoutStub,
  provideEditorTesting,
  provideLayout,
  provideSignedIn,
} from '../testing/editor-testing';
import { LeadsService } from '../services/leads.service';
import { VisitsService } from '../services/visits.service';
import { DashboardViewModel } from './dashboard.view-model';

describe('DashboardViewModel', () => {
  it('should build the dashboard from drafts, history and the current documents', () => {
    const testing = provideEditorTesting({
      'site/config': fakeDb.site.config,
      'home/offer': fakeDb.home.offer,
      'drafts/home__hero': { path: 'home/hero', content: { title: 'X' }, savedAt: 'x' },
      'publishes/2026-10-30T00-00-00-000Z': {
        publishedAt: '2026-10-30T00:00:00.000Z',
        changed: [],
        before: {},
      },
    });
    const layout = layoutStub();
    TestBed.configureTestingModule({
      providers: [...testing.providers, provideLayout(layout), DashboardViewModel],
    });
    const model = TestBed.inject(DashboardViewModel);

    model.init().subscribe();

    expect(model.data()?.changeCount).toBe(1);
    expect(model.data()?.lastPublished).toContain('30 Oct 2026');
    expect(model.data()?.warnings.map((warning) => warning.field)).toContain(
      'Offer card 1 · Duration and price',
    );
    expect(model.copy()).toBeNull();
  });

  it('should read only what a manager may see, skipping the owner’s cards (0019)', () => {
    const manager = { uid: 'manager', email: 'm@b.co' };
    const testing = provideEditorTesting({
      'roles/manager': {
        email: manager.email,
        pages: { team: 'hidden' },
        uploads: true,
        addedAt: 'x',
      },
      'drafts/home__hero': { path: 'home/hero', content: { title: 'X' }, savedAt: 'x' },
      'drafts/home__team': { path: 'home/team', content: { title: 'X' }, savedAt: 'x' },
    });
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        ...provideSignedIn(manager),
        provideLayout(layoutStub()),
        DashboardViewModel,
      ],
    });
    const leads = vi.spyOn(LeadsService.prototype, 'leads');
    const visits = vi.spyOn(VisitsService.prototype, 'load');
    const model = TestBed.inject(DashboardViewModel);

    model.init().subscribe();

    expect(model.data()?.changeCount).toBe(1);
    expect(model.data()?.access.owner).toBe(false);
    expect(model.data()?.access.approvalsHeading).toBe('Your requests');
    expect(leads).not.toHaveBeenCalled();
    expect(visits).not.toHaveBeenCalled();
  });

  it('should read and show a manager’s areas when the owner gave them some (0022)', () => {
    const manager = { uid: 'manager', email: 'm@b.co' };
    const testing = provideEditorTesting({
      'roles/manager': {
        email: manager.email,
        pages: {},
        uploads: true,
        addedAt: 'x',
        areas: { leads: true, visits: false, backups: true, goingBack: false },
      },
    });
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        ...provideSignedIn(manager),
        provideLayout(layoutStub()),
        DashboardViewModel,
      ],
    });
    const leads = vi.spyOn(LeadsService.prototype, 'leads');
    const visits = vi.spyOn(VisitsService.prototype, 'load');
    const model = TestBed.inject(DashboardViewModel);

    model.init().subscribe();

    expect(model.data()?.access).toMatchObject({ leads: true, backups: true, visits: false });
    expect(leads).toHaveBeenCalled();
    expect(visits).not.toHaveBeenCalled();
  });

  it('should tell the owner about self-approvals since they last looked (0023 D3)', () => {
    const testing = provideEditorTesting({
      'publishes/b': {
        publishedAt: '2026-11-21T10:00:00.000Z',
        changed: ['home/offer'],
        before: {},
        selfApproval: { title: '', note: '' },
      },
    });
    TestBed.configureTestingModule({
      providers: [...testing.providers, provideLayout(layoutStub()), DashboardViewModel],
    });
    const model = TestBed.inject(DashboardViewModel);

    model.init().subscribe();

    expect(model.data()?.selfApproved).toBe(
      '1 change self-approved by managers since you last looked.',
    );
  });
});
