import { TestBed } from '@angular/core/testing';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { provideFakeContent } from '@shared/testing/fixtures';
import { HOME } from '../../testing/home-fixtures';
import { HomeFaqViewModel } from './home-faq.view-model';

describe('HomeFaqViewModel', () => {
  it('should leave a hidden question out (2.15.0)', () => {
    const items = HOME.faq.items.map((item, index) => ({ ...item, hidden: index === 0 }));
    TestBed.configureTestingModule({
      providers: [
        provideFakeContent({ [ApiEndpoint.HomeFaq]: { ...HOME.faq, items } }).provider,
        HomeFaqViewModel,
      ],
    });
    const model = TestBed.inject(HomeFaqViewModel);

    model.init().subscribe();

    expect(model.data()?.items.map((item) => item.question)).toEqual(
      HOME.faq.items.slice(1).map((item) => item.question),
    );
  });
});
