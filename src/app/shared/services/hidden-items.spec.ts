import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import fakeDb from '@core/backends/fake/fake-db.json';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import {
  SHOW_FORMATS_FIXTURE,
  TEAM_FIXTURE,
  VIDEOS_FIXTURE,
  provideFakeContent,
} from '@shared/testing/fixtures';
import { GalleryService } from './gallery.service';
import { ShowFormatsService } from './show-formats.service';
import { TeamService } from './team.service';
import { VideosService } from './videos.service';

/** @returns The stored list with its first item hidden (2.15.0). */
function firstHidden<T extends object>(items: readonly T[]): T[] {
  return items.map((item, index) => (index === 0 ? { ...item, hidden: true } : item));
}

/** The shared lists leave hidden items out for every page that reads them (2.15.0). */
describe('hidden items in the shared lists', () => {
  function setUp(path: ApiEndpoint, items: readonly object[]): void {
    TestBed.configureTestingModule({
      providers: [provideFakeContent({ [path]: firstHidden(items) }).provider],
    });
  }

  it('should leave a hidden video out', async () => {
    setUp(ApiEndpoint.Videos, VIDEOS_FIXTURE);

    const videos = await firstValueFrom(TestBed.inject(VideosService).getVideos());

    expect(videos).toEqual(VIDEOS_FIXTURE.slice(1));
  });

  it('should leave a hidden team member out', async () => {
    setUp(ApiEndpoint.Team, TEAM_FIXTURE);

    expect(await firstValueFrom(TestBed.inject(TeamService).getTeam())).toEqual(
      TEAM_FIXTURE.slice(1),
    );
  });

  it('should leave a hidden show format out', async () => {
    setUp(ApiEndpoint.ShowFormats, SHOW_FORMATS_FIXTURE);

    expect(await firstValueFrom(TestBed.inject(ShowFormatsService).getFormats())).toEqual(
      SHOW_FORMATS_FIXTURE.slice(1),
    );
  });

  it('should leave a hidden photo out', async () => {
    setUp(ApiEndpoint.Gallery, fakeDb.gallery);

    expect(await firstValueFrom(TestBed.inject(GalleryService).attachViewDataHandler())).toEqual(
      fakeDb.gallery.slice(1),
    );
  });
});
