import { Injectable, computed, inject, signal } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { type ExperienceModel, ExperiencesModel } from './experiences.model';
import { HomeExperiencesService } from './home-experiences.service';

/** Loads the experiences and owns the selected filter, deriving which cards are visible. */
@Injectable()
export class HomeExperiencesViewModel extends ViewModel<ExperiencesModel> {
  /** Selected filter; defaults to "All" once the section has loaded. */
  public readonly category = computed(() => this.selected() ?? this.data()?.allLabel ?? '');
  public readonly showFeatured = computed(() => {
    const section = this.data();
    return section ? section.featured.matches(this.category(), section.allLabel) : false;
  });
  public readonly visibleItems = computed<readonly ExperienceModel[]>(() => {
    const section = this.data();
    return section
      ? section.items.filter((item) => item.matches(this.category(), section.allLabel))
      : [];
  });
  /** True when the filter matches no card at all. */
  public readonly isEmpty = computed(
    () => !this.showFeatured() && this.visibleItems().length === 0,
  );

  private readonly experiencesService = inject(HomeExperiencesService);
  private readonly selected = signal<string | null>(null);

  public selectCategory(category: string): void {
    this.selected.set(category);
  }

  protected override attachViewHandler(): Observable<unknown> {
    return this.experiencesService.attachViewDataHandler().pipe(
      tap((dto) => {
        this.setData(new ExperiencesModel(dto));
      }),
    );
  }
}
