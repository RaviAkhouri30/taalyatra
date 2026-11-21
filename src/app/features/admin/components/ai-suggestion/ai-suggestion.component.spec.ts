import { TestBed } from '@angular/core/testing';
import { AiSuggestionComponent } from './ai-suggestion.component';

describe('AiSuggestionComponent', () => {
  function render(text: string, maxLength: number | null = null) {
    const fixture = TestBed.createComponent(AiSuggestionComponent);
    fixture.componentRef.setInput('text', text);
    fixture.componentRef.setInput('maxLength', maxLength);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const click = (name: string) => {
      Array.from(element.querySelectorAll('button'))
        .find((button) => button.textContent.trim() === name)
        ?.click();
    };
    return { component: fixture.componentInstance, element, click };
  }

  it('should show the suggestion as a labelled region, keeping its line breaks', () => {
    const { element } = render('One\nTwo');

    expect(element.getAttribute('role')).toBe('region');
    expect(element.getAttribute('aria-label')).toBe('AI suggestion');
    expect(element.querySelector('.as-text')?.textContent).toBe('One\nTwo');
    expect(element.querySelector('.as-count')).toBeNull();
  });

  it('should count against the field’s limit, and mark it when over', () => {
    const { element } = render('Twelve chars', 10);

    expect(element.querySelector('.as-count')?.textContent).toBe('12 / 10 characters');
    expect(element.querySelector('.as-count--over')).not.toBeNull();
  });

  it('should pass on each choice', () => {
    const { component, click } = render('x');
    const used = vi.fn();
    const retried = vi.fn();
    const kept = vi.fn();
    component.used.subscribe(used);
    component.retried.subscribe(retried);
    component.kept.subscribe(kept);

    click('Use it');
    click('Try again');
    click('Keep mine');

    expect([used, retried, kept].every((spy) => spy.mock.calls.length === 1)).toBe(true);
  });
});
