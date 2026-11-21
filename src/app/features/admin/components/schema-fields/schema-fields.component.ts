import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { type AbstractControl, FormArray, FormRecord } from '@angular/forms';
import { fieldOf } from '../../forms/json-node';
import { ensureOneOn } from '../../forms/one-in-list';
import { buildListItem } from '../../forms/schema-control.factory';
import { moveListItem } from '../../forms/list-items';
import { cardContext } from '../../models/ai-assist';
import { FieldKind } from '../../models/field-kind.enum';
import {
  type FieldSchema,
  type IListFieldSchema,
  type ISortableList,
} from '../../models/i-field-schema';
import { ListOrderComponent } from '../list-order/list-order.component';
import { SchemaFieldComponent } from '../schema-field/schema-field.component';

/** One field as the template needs it: its control already narrowed to the right kind. */
interface IFieldEntry {
  readonly field: FieldSchema;
  readonly id: string;
  readonly control: AbstractControl | null;
  /** Set for groups: the nested fields. */
  readonly nested: readonly FieldSchema[] | null;
  /** Set for lists. */
  readonly list: { readonly schema: IListFieldSchema; readonly items: FormArray } | null;
  /** Reads the card's other prose when the AI help asks (0025 D3). */
  readonly context: () => string;
}

/** @returns A card's values now, by key; none when it isn't a group. */
function valuesOf(record: FormRecord | null): ReadonlyMap<string, unknown> {
  return new Map(Object.entries(record?.getRawValue() ?? {}));
}

/**
 * Renders editor fields from their schema (ADR-0014): groups as fieldsets, lists with add, remove
 * and reorder, everything else as a labelled field. Groups and list items render recursively.
 */
@Component({
  selector: 'app-schema-fields',
  imports: [ListOrderComponent, SchemaFieldComponent],
  templateUrl: './schema-fields.component.html',
  styleUrl: './schema-fields.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchemaFieldsComponent {
  /** The fields to render. */
  public readonly fields = input.required<readonly FieldSchema[]>();
  /** The group of controls they belong to. */
  public readonly group = input.required<AbstractControl | null>();
  /** Prefix for page-unique ids. */
  public readonly idPrefix = input.required<string>();

  protected readonly kind = FieldKind;
  protected readonly entries = computed<readonly IFieldEntry[]>(() => {
    const group = this.group();
    const record = group instanceof FormRecord ? group : null;
    return this.fields().map((field) => {
      const control = record?.get(field.key) ?? null;
      return {
        field,
        id: `${this.idPrefix()}-${field.key}`,
        control,
        nested: field.kind === FieldKind.Group ? field.fields : null,
        list:
          field.kind === FieldKind.List && control instanceof FormArray
            ? { schema: field, items: control }
            : null,
        context: () => cardContext(this.fields(), valuesOf(record), field.key),
      };
    });
  });

  /** The folding list items the owner has opened. */
  private readonly opened = signal<ReadonlySet<AbstractControl>>(new Set());

  /**
   * @param field A field.
   * @returns Whether it shows: a group that depends on a switch shows only while it's on.
   */
  protected isShown(field: FieldSchema): boolean {
    return field.kind !== FieldKind.Group || !field.onlyWhen
      ? true
      : this.group()?.get(field.onlyWhen)?.value === true;
  }

  protected add(list: IListFieldSchema, items: FormArray): void {
    const item = buildListItem(list);
    items.push(item);
    // A new item opens, ready to fill in.
    this.opened.update((opened) => new Set(opened).add(item));
  }

  /** Whether a folding list item is open. */
  protected isOpen(item: AbstractControl): boolean {
    return this.opened().has(item);
  }

  protected toggleItem(item: AbstractControl): void {
    this.opened.update((opened) => {
      const next = new Set(opened);
      if (!next.delete(item)) {
        next.add(item);
      }
      return next;
    });
  }

  /** @returns A folded item's one-line name: its title, else its label and number. */
  protected itemTitle(
    sortable: ISortableList,
    label: string,
    item: AbstractControl,
    index: number,
  ): string {
    const title = fieldOf(item.value, sortable.titleKey);
    return typeof title === 'string' && title.trim()
      ? title.trim()
      : `${label} ${String(index + 1)}`;
  }

  protected remove(list: IListFieldSchema, items: FormArray, index: number): void {
    items.removeAt(index);
    const unique =
      list.item.kind === FieldKind.Group
        ? list.item.fields.find((field) => field.kind === FieldKind.Toggle && field.oneInList)
        : undefined;
    if (unique) {
      ensureOneOn(items, unique.key);
    }
  }

  protected move(items: FormArray, index: number, offset: number): void {
    moveListItem(items, index, offset);
  }
}
