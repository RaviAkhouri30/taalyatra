import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  type OnInit,
  computed,
  effect,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CONTENT_MAX_LENGTH } from '@shared/constants/content-limits.constants';
import { type MediaAsset } from '../../models/media-asset.model';
import { MEDIA_ACCEPT } from '../../models/media-upload.constants';

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

  /** Where it's used, the way the owner sees it. */
  public readonly uses = input.required<readonly string[]>();
  /** Whether to ask the owner to confirm a delete. */
  public readonly confirming = input(false);
  /** Whether an action on this image is running. */
  public readonly busy = input(false);
  /** A message about the last action; empty for none. */
  public readonly notice = input('');
  /** Whether Replace and Delete are offered: the owner's only (0019). */
  public readonly canManage = input(true);
  /** Whether the description can be changed (0019: the owner, or a manager with uploads on). */
  public readonly canDescribe = input(true);

  /** Emits the new description when the owner leaves the field having changed it. */
  public readonly described = output<string>();
  /** Emits the photo chosen to replace this one. */
  public readonly replaced = output<File>();
  /** Emits when the owner presses Delete. */
  public readonly deleteAsked = output();
  /** Emits when the owner confirms the delete. */
  public readonly deleteConfirmed = output();
  /** Emits when the owner backs out of the delete. */
  public readonly deleteCancelled = output();

  protected readonly accept = MEDIA_ACCEPT;
  protected readonly maxLength = CONTENT_MAX_LENGTH.imageAlt;
  protected readonly fieldId = computed(() => `media-description-${this.asset().id}`);
  protected readonly description = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(CONTENT_MAX_LENGTH.imageAlt)],
  });

  public constructor() {
    // Follows the permission, which may arrive after the card is shown.
    effect(() => {
      if (this.canDescribe()) {
        this.description.enable({ emitEvent: false });
      } else {
        this.description.disable({ emitEvent: false });
      }
    });
  }

  public ngOnInit(): void {
    this.description.setValue(this.asset().dto.description);
  }

  /** @param input The file input, emptied so the same file can be chosen again. */
  protected chooseReplacement(input: HTMLInputElement): void {
    const file = input.files?.item(0);
    if (file) {
      this.replaced.emit(file);
    }
    input.value = '';
  }
}
