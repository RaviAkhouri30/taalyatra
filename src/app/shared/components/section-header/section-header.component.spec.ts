import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SectionHeaderComponent } from './section-header.component';

@Component({
  imports: [SectionHeaderComponent],
  template: `<app-section-header eyebrow="Gallery" title="Moments."
    ><a href="/x">All</a></app-section-header
  >`,
})
class HostComponent {}

describe('SectionHeaderComponent', () => {
  it('should render the eyebrow, the title and the projected action', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.eyebrow')?.textContent).toBe('Gallery');
    expect(element.querySelector('h2')?.textContent).toBe('Moments.');
    expect(element.querySelector('.ighead > a')?.textContent).toBe('All');
  });

  it('should omit the eyebrow when not given', () => {
    const fixture = TestBed.createComponent(SectionHeaderComponent);
    fixture.componentRef.setInput('title', 'Groups keep coming back.');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.eyebrow')).toBeNull();
  });
});
