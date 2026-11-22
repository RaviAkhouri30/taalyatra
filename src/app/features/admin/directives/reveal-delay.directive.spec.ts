import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RevealDelayDirective } from './reveal-delay.directive';

@Component({
  imports: [RevealDelayDirective],
  template: '<span [appRevealDelay]="90">word</span>',
})
class HostComponent {}

describe('RevealDelayDirective', () => {
  it('should delay the word’s animation by the given milliseconds', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();

    const span = (fixture.nativeElement as HTMLElement).querySelector('span');

    expect(span?.style.animationDelay).toBe('90ms');
  });
});
