/** How an editor field is entered, which also decides its validation. */
export enum FieldKind {
  Text = 'text',
  Multiline = 'multiline',
  Url = 'url',
  Tel = 'tel',
  Email = 'email',
  Date = 'date',
  Number = 'number',
  Toggle = 'toggle',
  Choice = 'choice',
  Group = 'group',
  List = 'list',
}
