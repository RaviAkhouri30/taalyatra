import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { cacheLatest } from '@shared/utils/cache-latest.util';
import { type IVideoDto } from '@shared/interfaces/i-video';

/**
 * Reads the video library (newest first), shared by the home teaser and the Videos page. Read
 * once per visit and replayed to every consumer (ADR-0011).
 */
@Service()
export class VideosService extends ApiBaseService<readonly IVideoDto[]> {
  private readonly cached$ = this.attachViewDataHandler().pipe(cacheLatest());

  public override attachViewDataHandler(): Observable<readonly IVideoDto[]> {
    return this.attachViewApiHandler(ApiEndpoint.Videos);
  }

  /** @returns The list; read once, then replayed to every subscriber. */
  public getVideos(): Observable<readonly IVideoDto[]> {
    return this.cached$;
  }
}
