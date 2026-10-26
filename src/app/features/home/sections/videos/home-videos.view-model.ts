import { Injectable, inject } from '@angular/core';
import { type Observable, combineLatest, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { VideosService } from '@shared/services/videos.service';
import { HomeVideosModel } from './home-videos.model';
import { HomeVideosService } from './home-videos.service';

/** Loads the heading and the video library, keeping the newest videos. */
@Injectable()
export class HomeVideosViewModel extends ViewModel<HomeVideosModel> {
  private readonly headingService = inject(HomeVideosService);
  private readonly videosService = inject(VideosService);

  protected override attachViewHandler(): Observable<unknown> {
    return combineLatest([
      this.headingService.attachViewDataHandler(),
      this.videosService.attachViewDataHandler(),
    ]).pipe(
      tap(([heading, videos]) => {
        this.setData(new HomeVideosModel(heading, videos));
      }),
    );
  }
}
