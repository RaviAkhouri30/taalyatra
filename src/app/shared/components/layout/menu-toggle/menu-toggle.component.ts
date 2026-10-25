import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Hamburger button that opens and closes the mobile navigation (tablet width and below). */
@Component({
  selector: 'app-menu-toggle',
  templateUrl: './menu-toggle.component.html',
  styleUrl: './menu-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuToggleComponent {
  public readonly open = input<boolean>(false);
  /** Id of the element the button controls. */
  public readonly controls = input.required<string>();
  public readonly toggled = output();
}
