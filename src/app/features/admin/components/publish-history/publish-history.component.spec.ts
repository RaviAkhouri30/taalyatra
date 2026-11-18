import { TestBed } from '@angular/core/testing';
import { type IHistoryEntry } from '../../models/publish-page.model';
import { PublishHistoryComponent } from './publish-history.component';

const entry = (id: string, newest: boolean): IHistoryEntry => ({
  record: { id, publishedAt: 'x', changed: ['home/hero'], before: {} },
  when: id,
  title: 'Hero',
  newest,
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
});
