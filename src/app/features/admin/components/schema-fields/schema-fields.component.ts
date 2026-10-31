import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type AbstractControl, FormArray, FormRecord } from '@angular/forms';
import { buildListItem } from '../../forms/schema-control.factory';
import { moveListItem } from '../../forms/list-items';
import { FieldKind } from '../../models/field-kind.enum';
import { type FieldSchema, type IListFieldSchema } from '../../models/i-field-schema';
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
}

/**
 * Renders editor fields from their schema (ADR-0014): groups as fieldsets, lists with add, remove
 * and reorder, everything else as a labelled field. Groups and list items render recursively.
 */
@Component({
  selector: 'app-schema-fields',
  imports: [SchemaFieldComponent],
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
      };
    });
  });

  protected add(list: IListFieldSchema, items: FormArray): void {
    items.push(buildListItem(list));
  }

  protected remove(items: FormArray, index: number): void {
    items.removeAt(index);
  }

  protected move(items: FormArray, index: number, offset: number): void {
    moveListItem(items, index, offset);
  }
}
