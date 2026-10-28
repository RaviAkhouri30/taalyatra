import { TestBed } from '@angular/core/testing';
import { provideFakeContent } from '@shared/testing/fixtures';
import { ShowsPageModel } from '../models/shows-page.model';
import { ShowsPageViewModel } from './shows-page.view-model';

describe('ShowsPageViewModel', () => {
  it('should build the page from its copy, the shared formats and site config', () => {
    TestBed.configureTestingModule({
      providers: [provideFakeContent().provider, ShowsPageViewModel],
    });
    const model = TestBed.inject(ShowsPageViewModel);

    model.init().subscribe();

    expect(model.data()).toBeInstanceOf(ShowsPageModel);
    expect(model.data()?.formats).toHaveLength(6);
  });
});
