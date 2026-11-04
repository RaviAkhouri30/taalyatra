import { type FieldKind } from './field-kind.enum';

/** What every editor field has. */
interface IFieldBase {
  /** The stored field's key inside its document (or group). */
  readonly key: string;
  /** The visible label. */
  readonly label: string;
  /** A short help line under the field. */
  readonly hint?: string;
}

/** Single- or multi-line text, a link, a phone number, an email address or a date. */
export interface ITextFieldSchema extends IFieldBase {
  readonly kind:
    | FieldKind.Text
    | FieldKind.Multiline
    | FieldKind.Url
    | FieldKind.Tel
    | FieldKind.Email
    | FieldKind.Date;
  /** Publishing is blocked while it's empty. */
  readonly required?: boolean;
  /** The most characters stored (matches `firestore.rules`). Not used for dates. */
  readonly maxLength?: number;
  /** The writing tip's target length: the counter warns past it, but saving still works. */
  readonly recommended?: number;
}

/** A whole number, e.g. the copyright year. */
export interface INumberFieldSchema extends IFieldBase {
  readonly kind: FieldKind.Number;
  readonly min: number;
  readonly max: number;
}

/** An on/off switch. Missing values are on, unless it's off by default. */
export interface IToggleFieldSchema extends IFieldBase {
  readonly kind: FieldKind.Toggle;
  /** Missing values are off, e.g. a new show isn't featured until the owner says so. */
  readonly offByDefault?: boolean;
}

/** One stored value from a fixed list. */
export interface IChoiceFieldSchema extends IFieldBase {
  readonly kind: FieldKind.Choice;
  readonly options: readonly { readonly value: string; readonly label: string }[];
}

/** An image on the site, stored as `IImage`: chosen from the library, described and cropped. */
export interface IImageFieldSchema extends IFieldBase {
  readonly kind: FieldKind.Image;
  /** The slot's width divided by its height, which the crop frame keeps to (D14). */
  readonly aspect: number;
  /** Decoration next to text that says the same thing, so no description is required. */
  readonly decorative?: boolean;
  /** The sibling field holding a YouTube link, whose thumbnail the owner can use (D20). */
  readonly thumbnailFromLink?: string;
}

/** A nested object, edited as a set of fields. */
export interface IGroupFieldSchema extends IFieldBase {
  readonly kind: FieldKind.Group;
  readonly fields: readonly FieldSchema[];
  /** A sibling switch: the group shows only while it's on, and is stored as `null` otherwise. */
  readonly onlyWhen?: string;
}

/** A list the owner can add to, remove from and reorder. */
export interface IListFieldSchema extends IFieldBase {
  readonly kind: FieldKind.List;
  /** Each item: a text field (strings), an image field (images) or a group (objects). */
  readonly item: ITextFieldSchema | IImageFieldSchema | IGroupFieldSchema;
  /** The add button's label, e.g. "Add offer card". */
  readonly addLabel: string;
  readonly maxItems: number;
}

/** Any editor field. */
export type FieldSchema =
  | ITextFieldSchema
  | INumberFieldSchema
  | IToggleFieldSchema
  | IChoiceFieldSchema
  | IImageFieldSchema
  | IGroupFieldSchema
  | IListFieldSchema;
