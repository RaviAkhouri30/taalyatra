import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { type IShowFormatCard } from '../../models/shows-page.model';

/** One show format on the Shows page: image, icon, name, description and its specs. */
@Component({
  selector: 'app-show-format-card',
  imports: [IconComponent, NgOptimizedImage],
  templateUrl: './show-format-card.component.html',
  styleUrl: './show-format-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowFormatCardComponent {
  public readonly format = input.required<IShowFormatCard>();
}
