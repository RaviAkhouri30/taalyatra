import { PreviewPicker } from './preview-picker';

describe('PreviewPicker', () => {
  const labels = new Map([
    ['shows', 'Shows'],
    ['top', 'Page content'],
  ]);

  function setUp() {
    document.head.innerHTML = '';
    document.body.innerHTML = `
      <section id="top"><h1>Hero</h1></section>
      <section id="shows"><p><a href="/shows">All shows</a></p></section>
      <section id="cities"><p>Not editable</p></section>`;
    const picked = vi.fn();
    new PreviewPicker(labels, picked).attach(window);
    return {
      picked,
      element: (selector: string) => document.querySelector<HTMLElement>(selector)!,
    };
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should add its styles to the preview', () => {
    setUp();

    expect(document.head.querySelector('style')?.textContent).toContain('ty-pick');
  });

  it('should outline the section under the pointer and say which tab edits it', () => {
    const { element } = setUp();

    element('#shows p').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

    expect(element('#shows').classList).toContain('ty-pick');
    expect(element('#ty-pick-badge').textContent).toBe('Edit in Shows');
  });

  it('should move the outline to the next section, and drop it when the pointer leaves', () => {
    const { element } = setUp();
    element('#shows p').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

    element('#top h1').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(element('#shows').classList).not.toContain('ty-pick');
    expect(element('#top').classList).toContain('ty-pick');

    document.dispatchEvent(new MouseEvent('mouseleave'));
    expect(element('#top').classList).not.toContain('ty-pick');
    expect(document.getElementById('ty-pick-badge')).toBeNull();
  });

  it('should pick the clicked section, and keep a link from leaving the page', () => {
    const { element, picked } = setUp();
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });

    element('#shows a').dispatchEvent(click);

    expect(picked).toHaveBeenCalledWith('shows');
    expect(click.defaultPrevented).toBe(true);
  });

  it('should ignore sections no card edits', () => {
    const { element, picked } = setUp();

    element('#cities p').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    element('#cities p').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

    expect(picked).not.toHaveBeenCalled();
    expect(document.getElementById('ty-pick-badge')).toBeNull();
  });
});
