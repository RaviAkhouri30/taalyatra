import { TestBed } from '@angular/core/testing';
import { AI_WORD_DELAY_MAX_MS } from '../../models/ai-choices';
import { AiSuggestionComponent } from './ai-suggestion.component';

describe('AiSuggestionComponent', () => {
  beforeEach(() => {
    // jsdom has no layout: the menu and suggestion scroll themselves into view.
    Element.prototype.scrollIntoView = vi.fn();
  });

  async function render(text: string | null, options: { max?: number; yours?: string } = {}) {
    const fixture = TestBed.createComponent(AiSuggestionComponent);
    fixture.componentRef.setInput('text', text);
    fixture.componentRef.setInput('label', 'Shorter');
    fixture.componentRef.setInput('yours', options.yours ?? '');
    fixture.componentRef.setInput('maxLength', options.max ?? null);
    document.body.append(fixture.nativeElement as HTMLElement);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const button = (name: string) =>
      Array.from(element.querySelectorAll('button')).find(
        (each) => each.textContent.trim() === name,
      );
    return { fixture, component: fixture.componentInstance, element, button };
  }

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('should shimmer under “Writing…” while the suggestion is written', async () => {
    const { element } = await render(null);

    expect(element.querySelector('.as-head')?.textContent).toContain('Writing…');
    expect(element.querySelectorAll('.as-shim')).toHaveLength(2);
    expect(element.querySelector('button')).toBeNull();
  });

  it('should bring the words in one after another, and give the text whole to screen readers', async () => {
    const { element } = await render('One two\nthree');
    const words = Array.from(element.querySelectorAll<HTMLElement>('.as-word'));

    expect(words.map((word) => word.textContent)).toEqual(['One ', 'two\n', 'three']);
    expect(words[1]?.style.animationDelay).toBe(`${String(AI_WORD_DELAY_MAX_MS)}ms`);
    expect(element.querySelector('.as-text')?.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelector('.visually-hidden')?.textContent).toBe('One two\nthree');
  });

  it('should be a labelled region headed by what was asked for', async () => {
    const { element } = await render('x');

    expect(element.getAttribute('role')).toBe('region');
    expect(element.getAttribute('aria-label')).toBe('AI suggestion');
    expect(element.querySelector('.as-head')?.textContent).toContain('Shorter');
  });

  it('should count against the field’s limit, and mark it when over', async () => {
    const { element } = await render('Twelve chars', { max: 10 });

    expect(element.querySelector('.as-count')?.textContent).toBe('12 / 10');
    expect(element.querySelector('.as-count--over')).not.toBeNull();
  });

  it('should show the owner’s own text beside it, when there was some', async () => {
    const { element } = await render('New', { yours: 'Old words' });

    expect(element.querySelector('.as-yours s')?.textContent).toBe('Old words');
  });

  it('should put focus on Use this when it arrives', async () => {
    const { button } = await render('x');

    expect(document.activeElement).toBe(button('Use this'));
  });

  it('should pass on each choice', async () => {
    const { component, button } = await render('x');
    const calls: string[] = [];
    component.used.subscribe(() => calls.push('used'));
    component.retried.subscribe(() => calls.push('retried'));
    component.discarded.subscribe(() => calls.push('discarded'));

    button('Use this')?.click();
    button('Try again')?.click();
    button('Discard')?.click();

    expect(calls).toEqual(['used', 'retried', 'discarded']);
  });
});
