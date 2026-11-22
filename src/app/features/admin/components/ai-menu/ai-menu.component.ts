import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
} from '@angular/core';
import { type IAiChoice } from '../../models/ai-choices';

/** Keys that move between the menu's choices, and by how many. */
const MOVES: ReadonlyMap<string, number> = new Map([
  ['ArrowDown', 1],
  ['ArrowUp', -1],
]);

/**
 * What the AI can do for one field (0029): a small menu under the field's ✦ chip. Focus goes to the
 * first choice; ↑ ↓ move, Home and End jump, Enter chooses, Esc and Tab close.
 */
@Component({
  selector: 'app-ai-menu',
  templateUrl: './ai-menu.component.html',
  styleUrl: './ai-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'menu',
    '[attr.aria-label]': 'label()',
    '[attr.aria-describedby]': 'describedBy() || null',
    '(keydown)': 'onKey($event)',
  },
})
export class AiMenuComponent {
  /** The menu's name for screen readers: "AI help". */
  public readonly label = input.required<string>();
  /** The id of what says which field it's for. */
  public readonly describedBy = input('');
  /** The small heading above the choices. */
  public readonly heading = input.required<string>();
  public readonly choices = input.required<readonly IAiChoice[]>();
  /** The owner chose one. */
  public readonly chosen = output<IAiChoice>();
  /** The owner closed the menu without choosing. */
  public readonly closed = output();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  public constructor() {
    afterNextRender(() => {
      // Into view above the editor's sticky publish bar (its scroll margin), then the first choice.
      this.host.nativeElement.scrollIntoView({ block: 'nearest' });
      this.items().at(0)?.focus({ preventScroll: true });
    });
  }

  /** @param event A key pressed in the menu. */
  protected onKey(event: KeyboardEvent): void {
    const move = MOVES.get(event.key);
    if (move !== undefined) {
      event.preventDefault();
      this.moveBy(move);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      (event.key === 'Home' ? this.items().at(0) : this.items().at(-1))?.focus();
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      event.preventDefault();
      this.closed.emit();
    }
  }

  private moveBy(step: number): void {
    const items = this.items();
    const current = items.findIndex(
      (item) => item === this.host.nativeElement.ownerDocument.activeElement,
    );
    items.at((current + step + items.length) % items.length)?.focus();
  }

  private items(): HTMLElement[] {
    return [...this.host.nativeElement.querySelectorAll<HTMLElement>('[role="menuitem"]')];
  }
}
