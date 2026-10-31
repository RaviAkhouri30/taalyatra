import { TestBed } from '@angular/core/testing';
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

  it('should show the account, the tab bar and the draft count', () => {
    const { element } = render();
    const tabs = Array.from(element.querySelectorAll('.ed-tabs a')).map((link) =>
      link.getAttribute('href'),
    );

    expect(element.querySelector('.who')?.textContent).toContain('owner@example.com');
    expect(tabs).toEqual([
      '/admin',
      '/admin/offer',
      '/admin/content',
      '/admin/visibility',
      '/admin/contact',
      '/admin/publish',
    ]);
    expect(element.querySelector('.count')?.textContent).toBe('1 unpublished');
  });

  it('should offer a retry only after a failed save', () => {
    const { fixture, element } = render();
    expect(element.querySelector('.ed-retry')).toBeNull();

    (
      fixture.componentInstance as unknown as { model: { reportFailed(): void } }
    ).model.reportFailed();
    fixture.detectChanges();

    expect(element.querySelector('[role="status"]')?.textContent).toContain('Couldn’t save');
    expect(element.querySelector('.ed-retry')).not.toBeNull();
  });
});
