import { TestBed } from '@angular/core/testing';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { provideFakeContent } from '@shared/testing/fixtures';
import { HOME } from '../../testing/home-fixtures';
import { HomeProofViewModel } from './home-proof.view-model';

describe('HomeProofViewModel', () => {
  it('should leave a hidden testimonial out (2.15.0)', () => {
    const testimonials = HOME.proof.testimonials.map((item, index) => ({
      ...item,
      hidden: index === 0,
    }));
    TestBed.configureTestingModule({
      providers: [
        provideFakeContent({ [ApiEndpoint.HomeProof]: { ...HOME.proof, testimonials } }).provider,
        HomeProofViewModel,
      ],
    });
    const model = TestBed.inject(HomeProofViewModel);

    model.init().subscribe();

    expect(model.data()?.testimonials.map((item) => item.name)).toEqual(
      HOME.proof.testimonials.slice(1).map((item) => item.name),
    );
  });
});
