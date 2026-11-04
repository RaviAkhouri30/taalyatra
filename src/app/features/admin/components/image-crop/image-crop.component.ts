import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { CropBoxDirective } from '../../directives/crop-box.directive';
import { CROP_MAX_ZOOM, CROP_MIN_ZOOM, CropFrame } from '../../models/crop-frame.model';
import { parseImageSrc } from '../../models/image-src';
import { type MediaAsset } from '../../models/media-asset.model';

/** One move button or arrow key's direction. */
interface ICropMove {
  readonly label: string;
  readonly symbol: string;
  readonly dx: number;
  readonly dy: number;
}

const MOVES: readonly ICropMove[] = [
  { label: 'Move the frame up', symbol: '↑', dx: 0, dy: -1 },
  { label: 'Move the frame left', symbol: '←', dx: -1, dy: 0 },
  { label: 'Move the frame right', symbol: '→', dx: 1, dy: 0 },
  { label: 'Move the frame down', symbol: '↓', dx: 0, dy: 1 },
];

const MOVES_BY_KEY: ReadonlyMap<string, ICropMove> = new Map(
  ['ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'].flatMap((key, index) => {
    const move = MOVES.at(index);
    return move ? [[key, move] as const] : [];
  }),
);

/** How far one press moves the frame, as a share of the image's width. */
const MOVE_STEP_RATIO = 0.02;

/** Where a drag started. */
interface ICropDrag {
  readonly startX: number;
  readonly startY: number;
  readonly frame: CropFrame;
  /** The file's pixels per pixel on screen. */
  readonly scale: number;
}

/**
 * The crop tool (D14): drag the frame, or use the buttons or arrow keys, so nothing depends on
 * dragging (WCAG 2.2, 2.5.7). The slider zooms. Presentational: it reports the frame on apply.
 */
@Component({
  selector: 'app-image-crop',
  imports: [CropBoxDirective, NgOptimizedImage],
  templateUrl: './image-crop.component.html',
  styleUrl: './image-crop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageCropComponent {
  /** The stored file. */
  public readonly asset = input.required<MediaAsset>();
  /** The slot's width divided by its height. */
  public readonly aspect = input.required<number>();
  /** The image's current `src`, which may hold an earlier crop. */
  public readonly src = input.required<string>();

  /** Emits the chosen frame. */
  public readonly applied = output<CropFrame>();
  /** Emits when the owner backs out. */
  public readonly cancelled = output();

  protected readonly moves = MOVES;
  protected readonly minZoom = CROP_MIN_ZOOM;
  protected readonly maxZoom = CROP_MAX_ZOOM;
  protected readonly frame = linkedSignal(() => {
    const { width, height } = this.asset().dto;
    return CropFrame.create(width, height, this.aspect(), parseImageSrc(this.src())?.crop ?? null);
  });
  protected readonly position = computed(() => this.frame().position);

  private drag: ICropDrag | null = null;

  /** @param move The direction to nudge the frame in. */
  protected move(move: ICropMove): void {
    const step = Math.max(1, Math.round(this.asset().dto.width * MOVE_STEP_RATIO));
    this.frame.update((frame) => frame.moveBy(move.dx * step, move.dy * step));
  }

  /** @param event A key press on the frame; the arrows would otherwise scroll the page. */
  protected keydown(event: KeyboardEvent): void {
    const move = MOVES_BY_KEY.get(event.key);
    if (move !== undefined) {
      event.preventDefault();
      this.move(move);
    }
  }

  /** @param zoom The slider's value. */
  protected zoomTo(zoom: number): void {
    this.frame.update((frame) => frame.zoomTo(zoom));
  }

  /**
   * @param event The press on the frame.
   * @param stage The image's container, which gives the on-screen scale.
   */
  protected startDrag(event: PointerEvent, stage: HTMLElement): void {
    // Keeps the drag going when the pointer leaves the frame.
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.drag = {
      startX: event.clientX,
      startY: event.clientY,
      frame: this.frame(),
      scale: this.asset().dto.width / stage.getBoundingClientRect().width,
    };
  }

  /** @param event The pointer moving; ignored unless a drag is under way. */
  protected dragTo(event: PointerEvent): void {
    if (this.drag === null) {
      return;
    }
    const { startX, startY, frame, scale } = this.drag;
    this.frame.set(
      frame.moveBy((event.clientX - startX) * scale, (event.clientY - startY) * scale),
    );
  }

  protected endDrag(): void {
    this.drag = null;
  }
}
