import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment';
import { APP_ENVIRONMENT } from './app-environment.token';
import { CLOUDINARY_CONFIG } from './cloudinary-config.token';

describe('CLOUDINARY_CONFIG', () => {
  it('should come from the environment when nothing overrides it', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: APP_ENVIRONMENT,
          useValue: { ...environment, cloudinary: { cloudName: 'demo' } },
        },
      ],
    });

    expect(TestBed.inject(CLOUDINARY_CONFIG).cloudName).toBe('demo');
  });
});
