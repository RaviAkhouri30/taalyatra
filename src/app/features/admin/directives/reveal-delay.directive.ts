import { Directive, input } from '@angular/core';

/**
 * When a word of an AI suggestion starts to arrive (0029). A host style binding: the delay differs
 * per word, and templates may not set styles themselves. With reduced motion the stylesheet runs
 * no animation, so the delay changes nothing.
 */
@Directive({
  selector: '[appRevealDelay]',
  host: { '[style.animation-delay.ms]': 'appRevealDelay()' },
})
export class RevealDelayDirective {
  /** The delay, in milliseconds. */
  public readonly appRevealDelay = input.required<number>();
}
