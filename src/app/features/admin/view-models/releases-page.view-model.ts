import { Injectable, inject } from '@angular/core';
import { type Observable, of, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { ReleasesPageModel } from '../models/releases-page.model';
import { ReleaseNotesService } from '../services/release-notes.service';
import { EditorLayoutViewModel } from './editor-layout.view-model';

/** What's new (0016 V1): the release notes; opening the page clears the New marker. */
@Injectable()
export class ReleasesPageViewModel extends ViewModel<ReleasesPageModel> {
  private readonly releaseNotes = inject(ReleaseNotesService);
  private readonly layout = inject(EditorLayoutViewModel);

  protected override attachViewHandler(): Observable<unknown> {
    // The notes are bundled with the build, so there's nothing to wait for.
    return of(new ReleasesPageModel(this.releaseNotes.releases())).pipe(
      tap((page) => {
        this.setData(page);
        this.layout.markReleasesSeen();
      }),
    );
  }
}
