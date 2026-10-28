import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { PAGES, TEAM_FIXTURE } from '@shared/testing/fixtures';
import { TeamPageModel } from './team-page.model';

describe('TeamPageModel', () => {
  it('should hold every member of the shared team and the page copy', () => {
    const page = new TeamPageModel(PAGES.team, TEAM_FIXTURE);

    expect(page.members).toBe(TEAM_FIXTURE);
    expect(page.values.items).toHaveLength(3);
    expect(page.ctaTitle).toBe('Want to play with us?');
  });

  it('should send the buttons to the proposal form and the Videos page', () => {
    const page = new TeamPageModel(PAGES.team, TEAM_FIXTURE);

    expect(page.plan).toMatchObject({ route: AppRoute.Home, fragment: PageAnchor.Contact });
    expect(page.videos).toMatchObject({ label: 'Watch our videos', route: AppRoute.Videos });
  });
});
