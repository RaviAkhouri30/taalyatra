import { EXPERIENCES_SECTIONS, GALLERY_SECTIONS, TEAM_SECTIONS } from '../schemas/media.sections';
import { MediaAsset } from './media-asset.model';
import { imageUsesIn, replaceImage } from './media-use';

describe('media uses', () => {
  const photos = GALLERY_SECTIONS.at(-1)!;
  const team = TEAM_SECTIONS.at(-1)!;
  const uploaded = 'c_crop,x_1,y_1,w_5,h_5/v1/taal-yatra/media/abc';
  const next = new MediaAsset({
    publicId: 'taal-yatra/media/new',
    version: 2,
    width: 2000,
    height: 1000,
    bytes: 1,
    format: 'jpg',
    name: 'new.jpg',
    description: '',
    uploadedAt: 'x',
  });

  describe('imageUsesIn', () => {
    it('should find an uploaded image in a list, named as the owner sees it', () => {
      const content = { _items: [{ src: uploaded, alt: 'A', width: 5, height: 5 }] };

      expect(imageUsesIn(photos, content)).toEqual([{ id: 'abc', label: 'Photos · Photo 1' }]);
    });

    it('should find one inside a group in a list', () => {
      const content = {
        _items: [{ name: 'Asha', photo: { src: uploaded, alt: 'A', width: 5, height: 5 } }],
      };

      expect(imageUsesIn(team, content)).toEqual([
        { id: 'abc', label: 'Team members · Team member 1 · Photo' },
      ]);
    });

    it('should find one in a section stored in another shape', () => {
      const cards = EXPERIENCES_SECTIONS.at(-1)!;
      const content = {
        featured: { name: 'A', image: { src: uploaded, alt: 'A', width: 5, height: 5 } },
        items: [],
      };

      expect(imageUsesIn(cards, content)).toEqual([
        { id: 'abc', label: 'Experiences · Experience 1 · Image' },
      ]);
    });

    it.each([
      ['a local image', { _items: [{ src: '/a.webp', alt: 'A', width: 5, height: 5 }] }],
      ['an empty document', {}],
      ['a missing document', null],
    ])('should find nothing in %s', (_case, content) => {
      expect(imageUsesIn(photos, content)).toEqual([]);
    });
  });

  describe('replaceImage', () => {
    it('should point a use at the new file, keeping its description and dropping its crop', () => {
      const image = { src: uploaded, alt: 'A circle', width: 5, height: 5 };

      expect(replaceImage(image, 'abc', next)).toEqual({
        src: 'v2/taal-yatra/media/new',
        alt: 'A circle',
        width: 2000,
        height: 1000,
      });
    });

    it('should reach uses inside lists and groups, and leave everything else alone', () => {
      const other = { src: 'v1/taal-yatra/media/other', alt: 'B', width: 1, height: 1 };
      const content = {
        title: 'Team',
        count: 4,
        none: null,
        _items: [{ name: 'Asha', photo: { src: uploaded, alt: 'A', width: 5, height: 5 } }, other],
      };

      expect(replaceImage(content, 'abc', next)).toEqual({
        title: 'Team',
        count: 4,
        none: null,
        _items: [
          {
            name: 'Asha',
            photo: { src: 'v2/taal-yatra/media/new', alt: 'A', width: 2000, height: 1000 },
          },
          other,
        ],
      });
    });
  });
});
