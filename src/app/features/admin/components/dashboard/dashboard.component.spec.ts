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
    expect(element.textContent).toContain('Nothing left to fill in');
  });

  it('should group the text still to fill in by section, each item with a Fix link', () => {
    const element = render({ 'home/offer': fakeDb.home.offer });
    const group = element.querySelector('.db-group')!;
    const first = group.querySelector('.db-todos li')!;

    expect(element.querySelector('.db-count')!.textContent).toMatch(/^\d+$/);
    expect(group.querySelector('summary b')!.textContent).toBe('Offer');
    expect(first.querySelector('b')!.textContent).toBe('Offer card 1 → Duration and price');
    expect(first.querySelector('small')!.textContent).toContain('replace it with your own words');
    expect(first.querySelector('a')!.getAttribute('href')).toBe('/admin/offer#card-offer');
  });

  it('should show one group per section, in menu order', () => {
    const team = Object.fromEntries(
      fakeDb.team.map((member, index) => [`team/${String(index + 1).padStart(3, '0')}`, member]),
    );
    const element = render({ 'home/offer': fakeDb.home.offer, ...team });

    expect(
      Array.from(element.querySelectorAll('.db-group summary b'), (label) => label.textContent),
    ).toEqual(['Offer', 'Team']);
  });
});
