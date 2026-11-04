import { Directive, input } from '@angular/core';

/** How the preview's frame sits in its stage. */
export interface IFrameFit {
  /** The width the site believes it has. */
  readonly width: number;
  /** The height it believes it has. */
  readonly height: number;
  /** How much it's shrunk to fit. */
  readonly scale: number;
  /** How far from the stage's left edge, in pixels. */
  readonly left: number;
}

/** Sizes the preview's frame; the numbers change with the stage and the chosen device. */
@Directive({
  selector: '[appFrameFit]',
  host: {
    '[style.width.px]': 'appFrameFit().width',
    '[style.height.px]': 'appFrameFit().height',
    '[style.left.px]': 'appFrameFit().left',
    '[style.transform]': '"scale(" + appFrameFit().scale + ")"',
  },
})
export class FrameFitDirective {
  /** The frame's fit. */
  public readonly appFrameFit = input.required<IFrameFit>();
}
