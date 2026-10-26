import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { queryAll } from '@shared/testing/fixtures';
import { FilterChipsComponent } from './filter-chips.component';

@Component({
  imports: [FilterChipsComponent],
  template: `<app-filter-chips label="Filter" [options]="options" [(selected)]="choice" />`,
})
class HostComponent {
  public readonly options = ['All', 'Melody', 'Movement'];
  public readonly choice = signal('All');
}

describe('FilterChipsComponent', () => {
  it('should mark the selected chip and update the binding on click', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const chips = queryAll(element, 'button');

    expect(element.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Filter');
    expect(chips[0]?.getAttribute('aria-pressed')).toBe('true');

    chips[1]?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.choice()).toBe('Melody');
    expect(chips[1]?.classList).toContain('sel');
    expect(chips[0]?.getAttribute('aria-pressed')).toBe('false');
  });
});
