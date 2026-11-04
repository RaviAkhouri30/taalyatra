import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FrameFitDirective } from './frame-fit.directive';

@Component({
  imports: [FrameFitDirective],
  template: '<div [appFrameFit]="{ width: 1280, height: 900, scale: 0.5, left: 10 }"></div>',
})
class HostComponent {}

describe('FrameFitDirective', () => {
  it('should size and scale the element', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const { style } = (fixture.nativeElement as HTMLElement).querySelector('div')!;

    expect([style.width, style.height, style.left, style.transform]).toEqual([
      '1280px',
      '900px',
      '10px',
      'scale(0.5)',
    ]);
  });
});
