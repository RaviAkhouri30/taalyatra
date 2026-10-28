import { TestBed } from '@angular/core/testing';
import { provideFakeContent } from '@shared/testing/fixtures';
import { AchievementsPageModel } from '../models/achievements-page.model';
import { AchievementsPageViewModel } from './achievements-page.view-model';

describe('AchievementsPageViewModel', () => {
  it('should build the page from its document', () => {
    TestBed.configureTestingModule({
      providers: [provideFakeContent().provider, AchievementsPageViewModel],
    });
    const model = TestBed.inject(AchievementsPageViewModel);

    model.init().subscribe();

    expect(model.data()).toBeInstanceOf(AchievementsPageModel);
  });
});
