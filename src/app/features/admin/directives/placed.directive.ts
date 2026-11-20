import { Directive, input } from '@angular/core';

/** Where a fixed element sits on the screen, in pixels; `null` leaves a side to the stylesheet. */
export interface IPlacement {
  readonly top: number | null;
  readonly left: number | null;
  readonly width: number | null;
  readonly height: number | null;
  readonly bottom: number | null;
}

/** Places the tour's highlight and card (0020 V9); the numbers change with the page and the step. */
@Directive({
  selector: '[appPlaced]',
  host: {
    '[style.top.px]': 'appPlaced().top',
    '[style.left.px]': 'appPlaced().left',
    '[style.width.px]': 'appPlaced().width',
    '[style.height.px]': 'appPlaced().height',
    '[style.bottom.px]': 'appPlaced().bottom',
  },
})
export class PlacedDirective {
  /** The placement. */
  public readonly appPlaced = input.required<IPlacement>();
}
