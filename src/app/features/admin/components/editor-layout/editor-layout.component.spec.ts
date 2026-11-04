import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { EditorNavService } from '../../services/editor-nav.service';
import { provideEditorTesting } from '../../testing/editor-testing';
import EditorLayoutComponent from './editor-layout.component';

describe('EditorLayoutComponent', () => {
  function render() {
    const testing = provideEditorTesting({
      'drafts/home__hero': { path: 'home/hero', content: {}, savedAt: 'x' },
    });
    TestBed.configureTestingModule({ providers: testing.providers });
    const fixture = TestBed.createComponent(EditorLayoutComponent);
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('should show the account, the side panel and the draft count', () => {
    const { element } = render();
    const tabs = Array.from(element.querySelectorAll('.ed-nav a')).map((link) =>
      link.getAttribute('href'),
    );

    expect(element.querySelector('.who')?.textContent).toContain('owner@example.com');
    expect(tabs).toEqual([
      '/admin',
      '/admin/content',
      '/admin/offer',
      '/admin/experiences',
      '/admin/gallery',
      '/admin/team',
      '/admin/shows',
      '/admin/videos',
      '/admin/contact',
      '/admin/visibility',
      '/admin/media',
      '/admin/publish',
    ]);
    expect(element.querySelector('.count')?.textContent).toBe('1 unpublished');
  });

  it('should group the links under small headings, with one group unlabelled', () => {
    const { element } = render();

    expect(
      Array.from(element.querySelectorAll('.ed-group-label')).map((label) => label.textContent),
    ).toEqual(['Content', 'Site', 'Publish']);
    expect(element.querySelector('nav a app-icon')).not.toBeNull();
  });

  it('should collapse to icons, keeping the names and adding hover titles', async () => {
    const { fixture, element } = render();
    const toggle = element.querySelector<HTMLButtonElement>('.ed-collapse')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Collapse menu');
    expect(element.querySelector('nav a')?.getAttribute('title')).toBeNull();

    toggle.click();
    await fixture.whenStable();

    expect(element.querySelector('.ed')?.classList).toContain('ed--collapsed');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('Expand menu');
    expect(element.querySelector('nav a')?.getAttribute('title')).toBe('Dashboard');
    expect(element.querySelector('nav a .ed-label')?.textContent).toBe('Dashboard');
  });

  it('should open the site in a new tab, so the editor stays open', () => {
    const { element } = render();
    const link = Array.from(element.querySelectorAll<HTMLAnchorElement>('.ed-action')).find(
      (action) => action.tagName === 'A',
    );

    expect(link?.target).toBe('_blank');
    expect(link?.rel).toBe('noopener');
  });

  it('should offer the Preview button only on a page with a preview', async () => {
    const { fixture, element } = render();
    const preview = () => element.querySelector('.ed-action--preview');
    expect(preview()).toBeNull();

    const nav = fixture.debugElement.injector.get(EditorNavService);
    nav.previewAvailable.set(true);
    await fixture.whenStable();
    expect(preview()?.getAttribute('aria-pressed')).toBe('true');

    preview()?.dispatchEvent(new MouseEvent('click'));
    await fixture.whenStable();

    expect(nav.previewHidden()).toBe(true);
    expect(preview()?.getAttribute('aria-pressed')).toBe('false');
  });

  describe('the slide-in menu', () => {
    async function open() {
      const rendered = render();
      rendered.element.querySelector<HTMLButtonElement>('.ed-menu')?.click();
      await rendered.fixture.whenStable();
      return rendered;
    }

    it('should open with a backdrop and move focus into the panel', async () => {
      const { element } = await open();
      document.body.append(element);

      expect(element.querySelector('.ed')?.classList).toContain('ed--drawer');
      expect(element.querySelector('.ed-menu')?.getAttribute('aria-expanded')).toBe('true');
      expect(element.querySelector('.ed-backdrop')).not.toBeNull();
    });

    it('should close when the backdrop is pressed', async () => {
      const { fixture, element } = await open();

      element.querySelector<HTMLButtonElement>('.ed-backdrop')?.click();
      await fixture.whenStable();

      expect(element.querySelector('.ed')?.classList).not.toContain('ed--drawer');
    });

    it('should close on Escape and give focus back to the menu button', async () => {
      const { fixture, element } = await open();
      document.body.append(element);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await fixture.whenStable();

      expect(element.querySelector('.ed')?.classList).not.toContain('ed--drawer');
      expect(document.activeElement).toBe(element.querySelector('.ed-menu'));
      element.remove();
    });

    it('should ignore Escape when it is already closed', async () => {
      const { fixture, element } = render();
      const focused = document.activeElement;

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await fixture.whenStable();

      expect(document.activeElement).toBe(focused);
      expect(element.querySelector('.ed')?.classList).not.toContain('ed--drawer');
    });

    it('should close when a link is chosen', async () => {
      const { fixture, element } = await open();
      TestBed.inject(Router).resetConfig([{ path: '**', children: [] }]);

      element.querySelector<HTMLAnchorElement>('nav a')?.click();
      await fixture.whenStable();

      expect(element.querySelector('.ed')?.classList).not.toContain('ed--drawer');
    });

    it('should close again when the menu button is pressed twice', async () => {
      const { fixture, element } = await open();

      element.querySelector<HTMLButtonElement>('.ed-menu')?.click();
      await fixture.whenStable();

      expect(element.querySelector('.ed')?.classList).not.toContain('ed--drawer');
    });
  });
});
