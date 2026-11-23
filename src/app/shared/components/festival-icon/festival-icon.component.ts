import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DiyaIconComponent } from '@shared/components/diya-icon/diya-icon.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { OM_SIGN, festivalLook } from '@shared/constants/festival-looks.constants';
import { type DiyaPalette } from '@shared/constants/promo.constants';
import { Festival } from '@shared/enums/festival.enum';
import { FestivalGlyph } from '@shared/enums/festival-glyph.enum';

/** The stroke icons' width on the 24-point grid, a little heavier at the badge's small size. */
const STROKE_WIDTH = 2.2;

/**
 * The offer badge's icon for a festival (2.16.0): today's diya for Diwali, the Om sign for Ganesh
 * Chaturthi, otherwise a stroke icon. Decorative: the badge's link carries the name.
 */
@Component({
  selector: 'app-festival-icon',
  imports: [DiyaIconComponent, IconComponent],
  templateUrl: './festival-icon.component.html',
  styleUrl: './festival-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FestivalIconComponent {
  /** The festival whose icon to draw. */
  public readonly festival = input<Festival>(Festival.Diwali);
  /** The diya's size and colouring; every icon takes its size. */
  public readonly diya = input.required<DiyaPalette>();

  protected readonly glyphs = FestivalGlyph;
  protected readonly om = OM_SIGN;
  protected readonly strokeWidth = STROKE_WIDTH;
  protected readonly icon = computed(() => festivalLook(this.festival()).icon);
  /** The stroke icon's name, or `null` for the diya and the Om sign. */
  protected readonly strokeIcon = computed(() => {
    const icon = this.icon();
    return icon === FestivalGlyph.Diya || icon === FestivalGlyph.Om ? null : icon;
  });
}
