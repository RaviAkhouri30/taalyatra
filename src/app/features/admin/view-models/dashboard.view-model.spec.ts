import { TestBed } from '@angular/core/testing';
import fakeDb from '@core/backends/fake/fake-db.json';
import { layoutStub, provideEditorTesting, provideLayout } from '../testing/editor-testing';
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
});
