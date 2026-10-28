import { TestBed } from '@angular/core/testing';
import { provideFakeContent } from '@shared/testing/fixtures';
import { TeamPageModel } from '../models/team-page.model';
import { TeamPageViewModel } from './team-page.view-model';

describe('TeamPageViewModel', () => {
  it('should build the page from its copy and the shared team', () => {
    TestBed.configureTestingModule({
      providers: [provideFakeContent().provider, TeamPageViewModel],
    });
    const model = TestBed.inject(TeamPageViewModel);

    model.init().subscribe();

    expect(model.data()).toBeInstanceOf(TeamPageModel);
    expect(model.data()?.members).toHaveLength(6);
  });
});
