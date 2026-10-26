import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  inject,
  viewChildren,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { LightboxComponent } from '@shared/components/lightbox/lightbox.component';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type HomeGalleryModel } from './home-gallery.model';
import { HomeGalleryViewModel } from './home-gallery.view-model';

/** Gallery (design `#gallery`): photo tiles that open a full-screen viewer, plus Instagram. */
@Component({
  selector: 'app-home-gallery',
  imports: [
    ButtonDirective,
    IconComponent,
    LightboxComponent,
    NgOptimizedImage,
    RouterLink,
    SectionHeaderComponent,
  ],
  templateUrl: './home-gallery.component.html',
  styleUrl: './home-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeGalleryViewModel],
})
export class HomeGalleryComponent extends BaseComponent<HomeGalleryModel> {
  protected override readonly model = inject(HomeGalleryViewModel);
  protected readonly anchor = PageAnchor.Gallery;
  protected readonly buttonVariant = ButtonVariant;
  protected readonly icons = IconName;

  private readonly tiles = viewChildren<ElementRef<HTMLButtonElement>>('tile');

  /** Closes the viewer and returns focus to the tile of the photo that was showing. */
  protected closeViewer(): void {
    const index = this.model.openIndex();
    this.model.close();
    if (index !== null) {
      this.tiles().at(index)?.nativeElement.focus();
    }
  }
}
