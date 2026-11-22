import { FieldKind } from '../models/field-kind.enum';
import { HOME_ICON_FIELD, groupList } from './home-parts';
import { text } from './schema-fields';

describe('home schema parts', () => {
  it('should offer the icons the site’s cards use today', () => {
    const icons = HOME_ICON_FIELD.options.map((option) => option.value);

    expect(icons).toEqual(
      expect.arrayContaining(['sparkle', 'djembe', 'group', 'home', 'briefcase', 'star']),
    );
  });

  it('should make a list of groups with its labels and limit when given an item’s fields', () => {
    const list = groupList('steps', ['Steps', 'Add step', 'Step'], 6, [text('title', 'Title')]);

    expect(list).toMatchObject({
      key: 'steps',
      label: 'Steps',
      kind: FieldKind.List,
      addLabel: 'Add step',
      maxItems: 6,
      item: { label: 'Step', kind: FieldKind.Group },
    });
  });
});
