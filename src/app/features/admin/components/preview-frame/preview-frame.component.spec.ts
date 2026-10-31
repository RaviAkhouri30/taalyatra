import { TestBed } from '@angular/core/testing';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { PreviewFrameComponent } from './preview-frame.component';

describe('PreviewFrameComponent', () => {
  function render() {
    const fixture = TestBed.createComponent(PreviewFrameComponent);
    const element = fixture.nativeElement as HTMLElement;
    const location = { replace: vi.fn(), pathname: '/', search: '?preview=1' };
    fixture.detectChanges();
    const iframe = element.querySelector('iframe')!;
    const site = { location } as unknown as Window;
    Object.defineProperty(iframe, 'contentWindow', { value: site });
    return { fixture, element, iframe, location };
  }

  it('should frame the site in preview mode and link to the full preview of the section', () => {
    const { fixture, element, iframe } = render();
    fixture.componentRef.setInput('anchor', PageAnchor.Team);
    fixture.detectChanges();

    expect(iframe.getAttribute('src')).toBe('/?preview=1');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/?preview=1#team');
    expect(element.querySelector('a')?.getAttribute('rel')).toBe('noopener');
  });

  it('should scroll the site to the section being edited once it has loaded', () => {
    const { fixture, iframe, location } = render();
    fixture.componentRef.setInput('anchor', PageAnchor.Team);
    fixture.detectChanges();
    expect(location.replace).not.toHaveBeenCalled();

    iframe.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(location.replace).toHaveBeenCalledWith('/?preview=1#team');
  });

  it('should load the preview afresh after a save, at the section being edited', () => {
    const { fixture, iframe, location } = render();
    iframe.dispatchEvent(new Event('load'));
    location.replace.mockClear();

    fixture.componentRef.setInput('version', 1);
    fixture.detectChanges();

    expect(location.replace).toHaveBeenCalledWith('/?preview=1&v=1#top');
  });

  it('should hold a reload for a save made during the first load until it finishes', () => {
    const { fixture, iframe, location } = render();

    fixture.componentRef.setInput('version', 2);
    fixture.detectChanges();
    expect(location.replace).not.toHaveBeenCalled();
    iframe.dispatchEvent(new Event('load'));
    iframe.dispatchEvent(new Event('load'));

    const reloads = location.replace.mock.calls.filter(([url]) => String(url).includes('&v='));
    expect(reloads).toEqual([['/?preview=1&v=2#top']]);
  });
});
