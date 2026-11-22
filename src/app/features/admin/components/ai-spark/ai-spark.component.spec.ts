import { TestBed } from '@angular/core/testing';
import { AiSparkComponent } from './ai-spark.component';

describe('AiSparkComponent', () => {
  it('should draw the sparkle at the size asked, hidden from screen readers', async () => {
    const fixture = TestBed.createComponent(AiSparkComponent);
    fixture.componentRef.setInput('size', 20);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelector('svg')?.getAttribute('width')).toBe('20');
  });
});
