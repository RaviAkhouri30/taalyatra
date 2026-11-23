import { TestBed } from '@angular/core/testing';
import { MiniBarsComponent } from './mini-bars.component';

describe('MiniBarsComponent', () => {
  async function render(totals: readonly number[]) {
    const fixture = TestBed.createComponent(MiniBarsComponent);
    fixture.componentRef.setInput(
      'days',
      totals.map((total, index) => ({ day: `2026-11-${String(12 + index)}`, total })),
    );
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('should draw a bar a day, the busiest full height and an empty day a sliver', async () => {
    const element = await render([0, 2, 4]);
    const heights = Array.from(element.querySelectorAll('rect')).map((rect) =>
      Number(rect.getAttribute('height')),
    );

    expect(heights).toEqual([2, 18, 36]);
  });

  it('should read the days out as words for screen readers', async () => {
    const element = await render([1, 3]);

    expect(element.getAttribute('role')).toBe('img');
    expect(element.getAttribute('aria-label')).toMatch(/^Visits, last 7 days: .+ 1, .+ 3$/);
  });
});
