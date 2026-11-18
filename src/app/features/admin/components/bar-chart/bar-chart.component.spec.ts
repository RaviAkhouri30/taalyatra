import { TestBed } from '@angular/core/testing';
import { type IChart } from '../../models/chart';
import { BarChartComponent } from './bar-chart.component';

describe('BarChartComponent', () => {
  const bar = (key: string, value: number | null) => ({
    key,
    label: key,
    title: `Day ${key}`,
    value,
  });

  function render(chart: IChart) {
    const fixture = TestBed.createComponent(BarChartComponent);
    fixture.componentRef.setInput('chart', chart);
    fixture.componentRef.setInput('caption', 'Visits');
    fixture.componentRef.setInput('headingId', 'test-visits');
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should draw a bar per period, scaled to the tallest, with its number on hover', () => {
    const element = render({
      bars: [bar('1', 2), bar('2', 4)],
      total: 6,
      summary: '6 visits.',
      max: 4,
    });
    const rects = Array.from(element.querySelectorAll('rect'));

    expect(element.querySelector('h2')?.textContent).toBe('Visits');
    expect(element.querySelector('figcaption p')?.textContent).toBe('6 visits.');
    expect(rects.map((rect) => rect.getAttribute('height'))).toEqual(['48', '96']);
    expect(rects[1]?.querySelector('title')?.textContent).toBe('Day 2: 4');
  });

  it('should keep a small number visible, and draw nothing for zero', () => {
    const element = render({
      bars: [bar('1', 1), bar('2', 0), bar('3', 1000)],
      total: 1001,
      summary: '',
      max: 1000,
    });

    expect(
      Array.from(element.querySelectorAll('rect')).map((rect) => rect.getAttribute('height')),
    ).toEqual(['2', '0', '96']);
  });

  it('should mark periods before counting began, and say so in the table', () => {
    const element = render({ bars: [bar('1', null), bar('2', 3)], total: 3, summary: '', max: 3 });

    expect(element.querySelectorAll('rect.bc-none')).toHaveLength(1);
    expect(element.querySelector('tbody td')?.textContent).toBe('Not counted yet');
  });

  it('should label only some bars when there are many, always the newest', () => {
    const bars = Array.from({ length: 30 }, (_, index) => bar(String(index), 1));
    const element = render({ bars, total: 30, summary: '', max: 1 });
    const labels = Array.from(element.querySelectorAll('.bc-labels span')).map(
      (span) => span.textContent,
    );

    expect(labels.filter((label) => label !== '')).toHaveLength(6);
    expect(labels.at(-1)).toBe('29');
  });

  it('should give every number in a table, for screen readers and phones', () => {
    const element = render({ bars: [bar('1', 1234)], total: 1234, summary: '', max: 1234 });

    expect(element.querySelector('tbody th')?.textContent).toBe('Day 1');
    expect(element.querySelector('tbody td')?.textContent).toBe('1,234');
    expect(element.querySelector('figure')?.getAttribute('aria-labelledby')).toBe('test-visits');
  });
});
