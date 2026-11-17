/** The class on the section under the pointer, and the label shown on it. */
const HOVER_CLASS = 'ty-pick';
const BADGE_ID = 'ty-pick-badge';
const BADGE_OFFSET_PX = 10;

/**
 * Injected into the preview only (never the public site): an outline on the section under the
 * pointer, and an "Edit in …" label. Colours match `$color-amber` and `$color-ink` in
 * `_tokens.scss`; SCSS can't reach inside the frame.
 */
const PICK_STYLES = `
.${HOVER_CLASS} { outline: 3px solid #e9a552 !important; outline-offset: -3px; cursor: pointer; }
#${BADGE_ID} {
  position: absolute; z-index: 100; padding: 6px 12px; border-radius: 999px; pointer-events: none;
  background: #e9a552; color: #171210; font: 700 13px/1.2 system-ui, sans-serif;
  box-shadow: 0 4px 14px rgb(0 0 0 / 40%);
}`;

/**
 * @returns The target as an element, or `null`. Checked by shape, not `instanceof Element`: the
 *   preview's elements belong to the frame's window, whose `Element` is a different class.
 */
function asElement(target: unknown): Element | null {
  return typeof target === 'object' && target !== null && 'closest' in target
    ? (target as Element)
    : null;
}

/**
 * Makes the preview's sections clickable (1.11.0): hovering one outlines it and says which tab edits
 * it; clicking it tells the editor to open that card. Links in the preview don't navigate it away.
 *
 * The frame shows this site, so its document is reachable (same origin).
 */
export class PreviewPicker {
  private hovered: Element | null = null;

  /**
   * @param labels The page sections that can be clicked, by element id, with the tab that edits them.
   * @param onPick Called with the clicked section's id.
   */
  public constructor(
    private readonly labels: ReadonlyMap<string, string>,
    private readonly onPick: (anchor: string) => void,
  ) {}

  /** @param site The preview's window, after each load (a reload is a new document). */
  public attach(site: Window): void {
    const { document } = site;
    const style = document.createElement('style');
    style.textContent = PICK_STYLES;
    document.head.append(style);
    document.addEventListener('mouseover', (event) => {
      this.hover(site, this.sectionOf(event.target));
    });
    document.addEventListener('mouseleave', () => {
      this.hover(site, null);
    });
    // Capture: decide before the site's own handlers, so a link doesn't navigate the preview.
    document.addEventListener(
      'click',
      (event) => {
        const section = this.sectionOf(event.target);
        if (section === null) {
          return;
        }
        if (asElement(event.target)?.closest('a[href]')) {
          event.preventDefault();
        }
        this.onPick(section.id);
      },
      true,
    );
  }

  /** @returns The clickable section around a target, or `null`. */
  private sectionOf(target: EventTarget | null): Element | null {
    let element = asElement(target);
    while (element !== null) {
      if (element.id && this.labels.has(element.id)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }

  private hover(site: Window, section: Element | null): void {
    if (section === this.hovered) {
      return;
    }
    this.hovered?.classList.remove(HOVER_CLASS);
    site.document.getElementById(BADGE_ID)?.remove();
    this.hovered = section;
    if (section === null) {
      return;
    }
    section.classList.add(HOVER_CLASS);
    const badge = site.document.createElement('div');
    badge.id = BADGE_ID;
    badge.textContent = `Edit in ${this.labels.get(section.id) ?? ''}`;
    const box = section.getBoundingClientRect();
    badge.style.top = `${String(box.top + site.scrollY + BADGE_OFFSET_PX)}px`;
    badge.style.left = `${String(box.left + site.scrollX + BADGE_OFFSET_PX)}px`;
    site.document.body.append(badge);
  }
}
