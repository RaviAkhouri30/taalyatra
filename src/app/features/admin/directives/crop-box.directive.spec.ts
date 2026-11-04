import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CropBoxDirective, type ICropBox } from './crop-box.directive';

@Component({
  imports: [CropBoxDirective],
  template: '<div [appCropBox]="box()"></div>',
})
class HostComponent {
  public readonly box = signal<ICropBox>({ left: 10, top: 20, width: 30, height: 40 });
}

describe('CropBoxDirective', () => {
  it('should position the element in percentages', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const { style } = (fixture.nativeElement as HTMLElement).querySelector('div')!;

    expect([style.left, style.top, style.width, style.height]).toEqual([
      '10%',
      '20%',
      '30%',
      '40%',
    ]);
  });
});
