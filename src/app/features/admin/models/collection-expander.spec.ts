import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { collapseCollection, expandCollection, isCollection } from './collection-expander';

describe('collection expansion', () => {
  const a = { title: 'A' };
  const b = { title: 'B' };
  const c = { title: 'C' };
  const set = (id: string, item: object, order: number) => ({
    kind: DocumentWriteKind.Set,
    path: `videos/${id}`,
    fields: { ...item, order },
  });

  it.each(['gallery', 'team', 'showFormats', 'videos'])(
    'should know %s is a collection',
    (path) => {
      expect(isCollection(path)).toBe(true);
    },
  );

  it.each(['home/videos', 'site/config', 'video'])('should know %s is not', (path) => {
    expect(isCollection(path)).toBe(false);
  });

  describe('collapse', () => {
    it('should list the documents by their order, without it', () => {
      const documents = new Map([
        ['002', { ...b, order: 1 }],
        ['001', { ...c, order: 2 }],
        ['003', { ...a, order: 0 }],
      ]);

      expect(collapseCollection(documents)).toEqual({ _items: [a, b, c] });
    });

    it('should give an empty list when nothing is stored', () => {
      expect(collapseCollection(new Map())).toEqual({ _items: [] });
    });

    it('should cope with a document that has no order', () => {
      expect(collapseCollection(new Map([['001', a]]))).toEqual({ _items: [a] });
    });
  });

  describe('expand', () => {
    it('should number the items in list order', () => {
      expect(expandCollection('videos', { _items: [a, b] }, [])).toEqual([
        set('001', a, 0),
        set('002', b, 1),
      ]);
    });

    it('should renumber when the list is reordered', () => {
      expect(expandCollection('videos', { _items: [b, a] }, ['001', '002'])).toEqual([
        set('001', b, 0),
        set('002', a, 1),
      ]);
    });

    it('should add documents when the list grows', () => {
      const writes = expandCollection('videos', { _items: [a, b, c] }, ['001']);

      expect(writes).toHaveLength(3);
      expect(writes.at(-1)).toEqual(set('003', c, 2));
    });

    it('should delete the numbers no longer used when the list shrinks', () => {
      expect(expandCollection('videos', { _items: [a] }, ['001', '002', '003'])).toEqual([
        set('001', a, 0),
        { kind: DocumentWriteKind.Delete, path: 'videos/002' },
        { kind: DocumentWriteKind.Delete, path: 'videos/003' },
      ]);
    });

    it('should delete everything when the list is empty', () => {
      expect(expandCollection('videos', { _items: [] }, ['001'])).toEqual([
        { kind: DocumentWriteKind.Delete, path: 'videos/001' },
      ]);
    });

    it.each([
      ['the list is missing', {}],
      ['the list is not a list', { _items: 'nope' }],
      ['an item is not an object', { _items: ['nope', null] }],
    ])('should write nothing new when %s', (_case, content) => {
      expect(expandCollection('videos', content, [])).toEqual([]);
    });
  });
});
