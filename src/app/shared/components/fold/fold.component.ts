import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FOLD_LABELS } from '@shared/constants/fold.constants';
import { FoldMode } from '@shared/enums/fold-mode.enum';
import { ViewportService } from '@shared/services/viewport.service';

/** Ids for the fold's body, unique on the page. */
let foldCount = 0;

function nextFoldId(): string {
  foldCount += 1;
  return `fold-${String(foldCount)}`;
}

/**
 * Folds a section's content behind a "Show more" button when its mode says so for this screen
 * (0015 V15). Folded content stays in the page with `hidden="until-found"`: search engines read
 * it, and Find on page opens it (`beforematch`). The section's heading stays outside the fold.
 */
@Component({
  selector: 'app-fold',
  templateUrl: './fold.component.html',
  styleUrl: './fold.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoldComponent {
  /** When it starts folded. */
  public readonly mode = input(FoldMode.Never);

  protected readonly labels = FOLD_LABELS;
  protected readonly bodyId = nextFoldId();
  protected readonly opened = signal(false);
  /** Whether this screen folds it at all; if not, the content shows with no button. */
  protected readonly foldable = computed(() => {
    const phone = this.viewport.isPhone();
    switch (this.mode()) {
      case FoldMode.Always:
        return true;
      case FoldMode.Phone:
        return phone;
      case FoldMode.Desktop:
        return !phone;
      default:
        return false;
    }
  });
  /** `until-found` while folded; no attribute otherwise. */
  protected readonly hidden = computed(() =>
    this.foldable() && !this.opened() ? 'until-found' : null,
  );

  private readonly viewport = inject(ViewportService);

  protected toggle(): void {
    this.opened.update((opened) => !opened);
  }

  /** Find on page opened it: keep the button in step. */
  protected onFound(): void {
    this.opened.set(true);
  }
}
