import { TestBed } from '@angular/core/testing';
import { type IHistoryEntry } from '../../models/publish-page.model';
import { PublishHistoryComponent } from './publish-history.component';

const entry = (id: string, newest: boolean, canGoBack = true): IHistoryEntry => ({
  record: { id, publishedAt: 'x', changed: ['home/hero'], before: {} },
  when: id,
  title: 'Hero',
  who: 'by you',
  newest,
  canGoBack,
});

describe('PublishHistoryComponent', () => {
  function render(entries: readonly IHistoryEntry[], confirming: string | null = null) {
    const fixture = TestBed.createComponent(PublishHistoryComponent);
    fixture.componentRef.setInput('entries', entries);
    fixture.componentRef.setInput('confirming', confirming);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const button = (name: string) =>
      Array.from(element.querySelectorAll('button')).find(
        (candidate) =>
          (candidate.getAttribute('aria-label') ?? candidate.textContent.trim()) === name,
      );
    return { fixture, element, button, component: fixture.componentInstance };
  }

  it('should say when nothing has been published', () => {
    const { element } = render([]);

    expect(element.textContent).toContain('Nothing published from the editor yet.');
  });

  it('should ask about going back to before a publish', () => {
    const older = entry('older', false);
    const { button, component } = render([entry('newer', true), older]);
    const asked = vi.fn();
    component.asked.subscribe(asked);

    button('Go back to before the publish of older')?.click();

    expect(asked).toHaveBeenCalledWith(older.record);
  });

  it('should pass on the owner’s answer: a backup first, go back, or cancel', () => {
    const older = entry('older', false);
    const { button, component } = render([entry('newer', true), older], 'older');
    const events: string[] = [];
    component.backupRequested.subscribe(() => events.push('backup'));
    component.confirmed.subscribe((record) => events.push(`go back ${record.id}`));
    component.cancelled.subscribe(() => events.push('cancel'));

    button('Download a backup first')?.click();
    button('Go back')?.click();
    button('Cancel')?.click();

    expect(events).toEqual(['backup', 'go back older', 'cancel']);
  });

  it('should show who published, and offer no going back to a manager', () => {
    const fixture = TestBed.createComponent(PublishHistoryComponent);
    fixture.componentRef.setInput('entries', [entry('newer', true, false)]);
    fixture.componentRef.setInput('canGoBack', false);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.ph-entry small')?.textContent).toBe('Hero · by you');
    expect(element.textContent).toContain('Only the owner can go back');
    expect(element.querySelector('button')).toBeNull();
  });

  it('should ask a manager with Going back to ask the owner about someone else’s publish', () => {
    const fixture = TestBed.createComponent(PublishHistoryComponent);
    fixture.componentRef.setInput('entries', [entry('mine', true), entry('theirs', false, false)]);
    fixture.componentRef.setInput('owner', false);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('those that changed only your pages');
    expect(element.querySelectorAll('button')).toHaveLength(1);
    expect(element.querySelector('.ph-ask')?.textContent).toContain('Ask the owner');
  });
});
