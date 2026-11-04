import { IMAGE_LOADER } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { CLOUDINARY_CONFIG } from '@core/tokens/cloudinary-config.token';
import { provideMediaImages } from './provide-media-images';

describe('provideMediaImages', () => {
  it('should build image addresses with the configured cloud when an image is loaded', () => {
    TestBed.configureTestingModule({
      providers: [
        provideMediaImages(),
        { provide: CLOUDINARY_CONFIG, useValue: { cloudName: 'demo' } },
      ],
    });

    const url = TestBed.inject(IMAGE_LOADER)({ src: 'v1/id', width: 100 });

    expect(url).toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_100/v1/id');
  });
});
