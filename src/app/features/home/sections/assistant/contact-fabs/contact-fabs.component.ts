import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';

/**
 * The call and WhatsApp shortcuts above the chat toggle (design `.fab`), in the floating
 * buttons' shared look (0015 V17). They step aside while the chat panel is open.
 */
@Component({
  selector: 'app-contact-fabs',
  imports: [IconComponent],
  templateUrl: './contact-fabs.component.html',
  styleUrl: './contact-fabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFabsComponent {
  /** `tel:` link. */
  public readonly callHref = input.required<string>();
  /** WhatsApp link. */
  public readonly whatsAppHref = input.required<string>();
  /** Accessible name of the call button. */
  public readonly callLabel = input.required<string>();
  /** Accessible name of the WhatsApp button. */
  public readonly whatsAppLabel = input.required<string>();
  /** True while the chat panel covers them: out of sight, the tab order and the accessibility tree. */
  public readonly hidden = input(false);

  protected readonly icon = IconName;
}
