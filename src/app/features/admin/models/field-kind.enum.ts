/** How an editor field is entered, which also decides its validation. */
export enum FieldKind {
  Text = 'text',
  Multiline = 'multiline',
  Url = 'url',
  Tel = 'tel',
  Email = 'email',
  Date = 'date',
  /** A `#rrggbb` colour, with the browser's colour picker beside it (0021). */
  Colour = 'colour',
  Number = 'number',
  Toggle = 'toggle',
  Choice = 'choice',
  Image = 'image',
  Group = 'group',
  List = 'list',
}
