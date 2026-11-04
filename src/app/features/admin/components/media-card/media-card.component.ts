import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  type OnInit,
  computed,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CONTENT_MAX_LENGTH } from '@shared/constants/content-limits.constants';
import { type MediaAsset } from '../../models/media-asset.model';

/** One image in the library, with its description. Presentational: the page saves changes. */
@Component({
  selector: 'app-media-card',
  imports: [NgOptimizedImage, ReactiveFormsModule],
  templateUrl: './media-card.component.html',
  styleUrl: './media-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaCardComponent implements OnInit {
  /** The image to show. */
  public readonly asset = input.required<MediaAsset>();

  /** Emits the new description when the owner leaves the field having changed it. */
  public readonly described = output<string>();

  protected readonly maxLength = CONTENT_MAX_LENGTH.imageAlt;
  protected readonly fieldId = computed(() => `media-description-${this.asset().id}`);
  protected readonly description = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(CONTENT_MAX_LENGTH.imageAlt)],
  });

  public ngOnInit(): void {
    this.description.setValue(this.asset().dto.description);
  }
}
