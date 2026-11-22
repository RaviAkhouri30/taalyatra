import { TestBed } from '@angular/core/testing';
import { provideEditorTesting, provideSignedIn } from '../../testing/editor-testing';
import FeaturesPageComponent from './features-page.component';

describe('FeaturesPageComponent', () => {
  function render(user?: { uid: string; email: string }, seed = {}) {
    TestBed.configureTestingModule({
      providers: [...provideEditorTesting(seed).providers, ...(user ? provideSignedIn(user) : [])],
    });
    const fixture = TestBed.createComponent(FeaturesPageComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show each feature with links to see and change it', () => {
    const element = render();
    const offer = element.querySelector('[aria-labelledby="fp-card-offer"]');
    const links = Array.from(offer?.querySelectorAll('a') ?? []).map((link) =>
      link.getAttribute('href'),
    );

    expect(element.querySelectorAll('h2')).toHaveLength(4);
    expect(links).toEqual(['/#diwali', '/admin/offer']);
    expect(offer?.querySelector('a')?.getAttribute('target')).toBe('_blank');
  });

  it('should tell a manager who manages a page hidden from them', () => {
    const manager = { uid: 'manager', email: 'm@b.co' };
    const element = render(manager, {
      'roles/manager': {
        email: manager.email,
        pages: { team: 'hidden' },
        uploads: true,
        addedAt: 'x',
      },
    });
    const team = element.querySelector('[aria-labelledby="fp-card-team"]');

    expect(team?.querySelector('.fp-note')?.textContent).toBe('Managed by the owner');
    expect(element.querySelector('[aria-labelledby="fp-card-leads"]')).toBeNull();
  });
});
