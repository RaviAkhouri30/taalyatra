import { TestBed } from '@angular/core/testing';
import { provideEditorTesting } from '../testing/editor-testing';
import { FeaturesPageViewModel } from './features-page.view-model';

describe('FeaturesPageViewModel', () => {
  it('should list the features for the signed-in account', () => {
    TestBed.configureTestingModule({
      providers: [...provideEditorTesting().providers, FeaturesPageViewModel],
    });
    const model = TestBed.inject(FeaturesPageViewModel);

    model.init().subscribe();

    expect(model.data()?.map((group) => group.label)).toEqual(['Home page', 'Every page', 'Admin']);
  });
});
