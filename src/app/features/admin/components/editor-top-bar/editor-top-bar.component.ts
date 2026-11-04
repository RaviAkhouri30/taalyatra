import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  inject,
  output,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { AppRoute } from '@shared/enums/app-route.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { EditorNavService } from '../../services/editor-nav.service';
import { EditorLayoutViewModel } from '../../view-models/editor-layout.view-model';

/** The bar across the top of the editor: the name, the account, and the Preview and site buttons. */
@Component({
  selector: 'app-editor-top-bar',
  imports: [IconComponent, NgOptimizedImage, RouterLink],
  templateUrl: './editor-top-bar.component.html',
  styleUrl: './editor-top-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorTopBarComponent {
  /** Emits when the owner presses Menu on a phone or tablet. */
  public readonly menuToggled = output();

  protected readonly model = inject(EditorLayoutViewModel);
  protected readonly nav = inject(EditorNavService);
  protected readonly dashboardUrl = AppRoute.Admin;
  // A new tab, so the editor stays open, and a full load, so it reads the newest published content.
  protected readonly siteUrl = AppRoute.Home;
  protected readonly icons = IconName;

  private readonly menuButton = viewChild.required<ElementRef<HTMLButtonElement>>('menuButton');

  /** Gives focus back to Menu, so it isn't lost when the slide-in panel hides. */
  public focusMenu(): void {
    this.menuButton().nativeElement.focus();
  }
}
