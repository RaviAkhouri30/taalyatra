import { TestBed } from '@angular/core/testing';
import fakeDb from '@core/backends/fake/fake-db.json';
import { AdminPageModel } from '../../models/admin-page.model';
import { layoutStub, provideEditorTesting, provideLayout } from '../../testing/editor-testing';
import DashboardComponent from './dashboard.component';

describe('DashboardComponent', () => {
  function render(seed: Parameters<typeof provideEditorTesting>[0]) {
    const testing = provideEditorTesting(seed);
    const layout = layoutStub();
    TestBed.configureTestingModule({ providers: [...testing.providers, provideLayout(layout)] });
    layout.data.set(new AdminPageModel(fakeDb.pages.admin, fakeDb.site.config.brand));
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should welcome the owner and show a card per topic, each linking to where it changes', () => {
    const element = render({ 'site/config': fakeDb.site.config });
    const links = Array.from(element.querySelectorAll('.db-card a')).map((link) =>
      link.getAttribute('href'),
    );

    expect(element.querySelector('h1')?.textContent).toBe('Welcome back');
    expect(element.querySelector('.db-pill')?.textContent).toBe('live');
    expect(links).toEqual([
      '/admin/publish',
      '/admin/offer',
      '/admin/visibility',
      '/admin/publish',
    ]);
    expect(element.textContent).toContain('No placeholder text left');
  });

  it('should list placeholders still in the content', () => {
    const element = render({ 'home/offer': fakeDb.home.offer });

    expect(element.querySelectorAll('.db-card--wide li').length).toBeGreaterThan(0);
  });
});
