import { Injectable, computed, inject, signal } from '@angular/core';
import { type Observable, combineLatest, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { GalleryService } from '@shared/services/gallery.service';
import { HomeGalleryModel } from './home-gallery.model';
import { HomeGalleryService } from './home-gallery.service';

/** Loads the gallery and owns which photo the viewer shows (wrapping around at either end). */
@Injectable()
export class HomeGalleryViewModel extends ViewModel<HomeGalleryModel> {
  /** Index of the photo open in the viewer, or `null` when it is closed. */
  public readonly openIndex = computed(() => this.open());

  private readonly headingService = inject(HomeGalleryService);
  private readonly galleryService = inject(GalleryService);
  private readonly open = signal<number | null>(null);

  public show(index: number): void {
    this.open.set(index);
  }

  public close(): void {
    this.open.set(null);
  }

  public previous(): void {
    this.step(-1);
  }

  public next(): void {
    this.step(1);
  }

  protected override attachViewHandler(): Observable<unknown> {
    return combineLatest([
      this.headingService.attachViewDataHandler(),
      this.galleryService.attachViewDataHandler(),
    ]).pipe(
      tap(([heading, photos]) => {
        this.setData(new HomeGalleryModel(heading, photos));
      }),
    );
  }

  private step(delta: number): void {
    const total = this.data()?.photos.length ?? 0;
    const current = this.open();
    if (current !== null && total > 0) {
      this.open.set((current + delta + total) % total);
    }
  }
}
