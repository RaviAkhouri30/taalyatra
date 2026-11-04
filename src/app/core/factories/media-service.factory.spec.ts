import { HttpBackend, HttpXhrBackend } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CloudinaryMediaService } from '@core/backends/cloudinary/cloudinary-media.service';
import { FakeMediaService } from '@core/backends/fake/fake-media.service';
import { provideMedia } from '@core/config/provide-media';
import { BackendType } from '@core/enums/backend-type.enum';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { IMediaService } from '@core/interfaces/i-media-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';

describe('mediaServiceFactory', () => {
  const cloud = { cloudName: 'demo' };
  const noCloud = { cloudName: '' };

  it.each([
    ['Cloudinary for Firebase with a cloud', BackendType.Firebase, cloud, CloudinaryMediaService],
    ['the fake for Firebase without a cloud', BackendType.Firebase, noCloud, FakeMediaService],
    ['the fake for the fake backend', BackendType.Fake, cloud, FakeMediaService],
  ])('should provide %s', (_case, backend, cloudinary, adapter) => {
    TestBed.configureTestingModule({
      providers: [
        provideMedia(),
        { provide: IAuthService, useValue: {} },
        { provide: APP_ENVIRONMENT, useValue: { ...environment, backend, cloudinary } },
      ],
    });

    expect(TestBed.inject(IMediaService)).toBeInstanceOf(adapter);
  });

  // Angular's default fetch transport refuses a request that asks for upload progress.
  it('should send uploads over XHR, which can report progress', () => {
    TestBed.configureTestingModule({
      providers: [provideMedia(), { provide: IAuthService, useValue: {} }],
    });

    expect(TestBed.inject(HttpBackend)).toBeInstanceOf(HttpXhrBackend);
  });
});
