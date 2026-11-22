import { TestBed } from '@angular/core/testing';
import { AI_REWRITES, type IAiChoice } from '../../models/ai-choices';
import { AiMenuComponent } from './ai-menu.component';

describe('AiMenuComponent', () => {
  beforeEach(() => {
    // jsdom has no layout: the menu and suggestion scroll themselves into view.
    Element.prototype.scrollIntoView = vi.fn();
  });

  async function render() {
    const fixture = TestBed.createComponent(AiMenuComponent);
    fixture.componentRef.setInput('label', 'AI help');
    fixture.componentRef.setInput('describedBy', 'headline-ai-for');
    fixture.componentRef.setInput('heading', 'Rewrite it');
    fixture.componentRef.setInput('choices', AI_REWRITES);
    const chosen: IAiChoice[] = [];
    let closed = 0;
    fixture.componentInstance.chosen.subscribe((choice) => chosen.push(choice));
    fixture.componentInstance.closed.subscribe(() => (closed += 1));
    document.body.append(fixture.nativeElement as HTMLElement);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const items = () => Array.from(element.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    const press = (key: string) => {
      element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    };
    return { element, items, press, chosen, closed: () => closed };
  }

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('should be a named menu with a heading and a choice for each rewrite', async () => {
    const { element, items } = await render();

    expect(element.getAttribute('role')).toBe('menu');
    expect(element.getAttribute('aria-label')).toBe('AI help');
    expect(element.getAttribute('aria-describedby')).toBe('headline-ai-for');
    expect(element.querySelector('.am-heading')?.textContent).toBe('Rewrite it');
    expect(items().map((item) => item.textContent.replace(/\s+/gu, ' ').trim())).toEqual([
      '◎ Clearer',
      '↧ Shorter',
      '♡ Warmer',
      '▤ More formal',
      '✓ Fix spelling and grammar',
    ]);
  });

  it('should start on the first choice and move with the arrow keys, round the ends', async () => {
    const { items, press } = await render();
    expect(document.activeElement).toBe(items()[0]);

    press('ArrowUp');
    expect(document.activeElement).toBe(items().at(-1));
    press('ArrowDown');

    expect(document.activeElement).toBe(items()[0]);
  });

  it('should jump to the last and first choices with End and Home', async () => {
    const { items, press } = await render();

    press('End');
    expect(document.activeElement).toBe(items().at(-1));
    press('Home');

    expect(document.activeElement).toBe(items()[0]);
  });

  it('should pass on the choice clicked', async () => {
    const { items, chosen } = await render();

    items()[1]?.click();

    expect(chosen).toEqual([AI_REWRITES[1]]);
  });

  it.each(['Escape', 'Tab'])('should close when %s is pressed', async (key) => {
    const { press, closed } = await render();

    press(key);

    expect(closed()).toBe(1);
  });
});
