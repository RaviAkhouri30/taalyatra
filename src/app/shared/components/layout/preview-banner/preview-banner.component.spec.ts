import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { PreviewBannerComponent } from './preview-banner.component';

describe('PreviewBannerComponent', () => {
  function render() {
    const fixture = TestBed.createComponent(PreviewBannerComponent);
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('should announce the preview and link back to the editor and the live site', () => {
    const { element } = render();
    const links = Array.from(element.querySelectorAll('a')).map((link) =>
      link.getAttribute('href'),
    );

    expect(element.getAttribute('role')).toBe('status');
    expect(element.textContent).toContain('Preview of unpublished changes');
    expect(links).toEqual(['/admin', '/']);
  });

  it('should keep preview pages out of search engines while it is shown', () => {
    const { fixture } = render();
    const meta = TestBed.inject(Meta);

    expect(meta.getTag('name="robots"')?.content).toBe('noindex, nofollow');
    fixture.destroy();
    expect(meta.getTag('name="robots"')).toBeNull();
  });
});
