import { FormControl } from '@angular/forms';
import { imageChosenValidator, imageDescribedValidator, toImage } from './image-value';

describe('image values', () => {
  const image = { src: '/a.webp', alt: 'A circle', width: 10, height: 20 };

  it('should keep a stored image as it is', () => {
    expect(toImage(image)).toEqual(image);
  });

  it.each([undefined, null, 'text', { src: 1, alt: 2, width: '3', height: '4' }])(
    'should fall back to an empty image when %s is stored',
    (stored) => {
      expect(toImage(stored)).toEqual({ src: '', alt: '', width: 0, height: 0 });
    },
  );

  it('should ask for a photo when none is chosen', () => {
    expect(imageChosenValidator(new FormControl({ ...image, src: '' }))).toEqual({
      imageMissing: true,
    });
    expect(imageChosenValidator(new FormControl(image))).toBeNull();
  });

  it.each(['', '   '])('should ask for a description when it is "%s"', (alt) => {
    expect(imageDescribedValidator(new FormControl({ ...image, alt }))).toEqual({
      imageDescription: true,
    });
  });

  it('should accept a described photo', () => {
    expect(imageDescribedValidator(new FormControl(image))).toBeNull();
  });
});
