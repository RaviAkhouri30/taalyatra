import { CdkDrag, type CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { type AbstractControl, type FormArray } from '@angular/forms';
import { fieldOf } from '../../forms/json-node';
import { moveListItemTo } from '../../forms/list-items';
import { type ISortableList } from '../../models/i-field-schema';

/** One item as the Order panel shows it. */
interface IOrderRow {
  readonly control: AbstractControl;
  readonly index: number;
  readonly title: string;
  readonly featured: boolean;
}

/**
 * A list's Order panel (0015 V14): its items by name, dragged into place or moved with the
 * arrows (the keyboard and screen-reader way). The featured item is pinned first. Moves change
 * the form list itself, so the items below follow, and the site shows this order once published.
 */
@Component({
  selector: 'app-list-order',
  imports: [CdkDrag, CdkDragHandle, CdkDropList],
  templateUrl: './list-order.component.html',
  styleUrl: './list-order.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListOrderComponent {
  /** The list's controls. */
  public readonly items = input.required<FormArray>();
  /** Which keys name an item and mark it featured. */
  public readonly sortable = input.required<ISortableList>();
  /** An item's label, e.g. "Show", for untitled items. */
  public readonly itemLabel = input.required<string>();
  /**
   * The list's current value. A form list changes in place, so this is what tells the panel it
   * changed: the editor passes `items.value`, a new array after every change. (Not `toSignal` of
   * `valueChanges`: that pulls Angular's RxJS bridge into the site's first download.)
   */
  public readonly value = input.required<unknown>();

  protected readonly rows = computed(() => {
    this.value();
    return this.rowsOf(this.items());
  });
  /** Whether the first row is a pinned featured item. */
  protected readonly pinned = computed(() => this.rows()[0]?.featured ?? false);

  private readonly changeDetector = inject(ChangeDetectorRef);

  public constructor() {
    // An item switched to featured moves to the top, where it's pinned.
    effect(() => {
      const featured = this.rows().findIndex((row) => row.featured);
      if (featured > 0) {
        untracked(() => {
          moveListItemTo(this.items(), featured, 0);
        });
        // No click caused this move, so nothing else tells the editor to redraw its items.
        this.changeDetector.markForCheck();
      }
    });
  }

  protected canMoveUp(row: IOrderRow): boolean {
    return !row.featured && row.index > (this.pinned() ? 1 : 0);
  }

  protected canMoveDown(row: IOrderRow): boolean {
    return !row.featured && row.index < this.rows().length - 1;
  }

  /**
   * Moves the row's item by its position now, not the row's: a quick second press can land
   * before the panel has redrawn, and the row would still hold the old position.
   * @param offset -1 for up, 1 for down.
   */
  protected move(row: IOrderRow, offset: number): void {
    const list = this.items();
    const index = list.controls.indexOf(row.control);
    const floor = this.pinned() ? 1 : 0;
    const target = index + offset;
    if (index < 0 || target < floor || row.featured) {
      return;
    }
    moveListItemTo(list, index, target);
  }

  protected drop(event: CdkDragDrop<readonly IOrderRow[]>): void {
    // Nothing goes above the pinned featured item.
    const to = Math.max(event.currentIndex, this.pinned() ? 1 : 0);
    moveListItemTo(this.items(), event.previousIndex, to);
  }

  private rowsOf(list: FormArray): readonly IOrderRow[] {
    const { titleKey, featuredKey } = this.sortable();
    return list.controls.map((control, index) => {
      const value: unknown = control.value;
      const title = fieldOf(value, titleKey);
      return {
        control,
        index,
        title:
          typeof title === 'string' && title.trim()
            ? title.trim()
            : `${this.itemLabel()} ${String(index + 1)}`,
        featured: featuredKey !== undefined && fieldOf(value, featuredKey) === true,
      };
    });
  }
}
