import { Directive, computed, input, output } from '@angular/core';
import { festivalLook } from '@shared/constants/festival-looks.constants';
import { Festival } from '@shared/enums/festival.enum';
import { type IPromotion } from '@shared/interfaces/i-promotion';

/**
 * What the pill and card badges share: the offer, the close button's event, and the festival look
 * chosen with the offer's dates (2.16.0). Until one is chosen the badge is Diwali's, as before.
 */
@Directive()
export abstract class PromoStyle {
  public readonly promotion = input.required<IPromotion>();
  /** Emits when the visitor closes the badge. */
  public readonly dismiss = output();

  protected readonly festival = computed(() => this.promotion().festival ?? Festival.Diwali);
  /** Diwali keeps the badge's own sparks; the others draw their festival's effect around it. */
  protected readonly isDiwali = computed(() => this.festival() === Festival.Diwali);
  /** No festival has no animation: no sparks, no ring. */
  protected readonly animated = computed(() => festivalLook(this.festival()).animated);
}
