import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { type IContactDetails } from '@shared/interfaces/i-contact-details';
import { type INavLink } from '@shared/interfaces/i-site-link';
import { toTelHref, toWhatsAppUrl } from '@shared/utils/contact-links.util';

/** Bar pinned to the bottom of phone screens: call, WhatsApp and the page's call to action. */
@Component({
  selector: 'app-mobile-action-bar',
  imports: [IconComponent, RouterLink],
  templateUrl: './mobile-action-bar.component.html',
  styleUrl: './mobile-action-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileActionBarComponent {
  public readonly contact = input.required<IContactDetails>();
  public readonly cta = input.required<INavLink>();

  protected readonly telHref = computed(() => toTelHref(this.contact().phone));
  protected readonly whatsAppUrl = computed(() => toWhatsAppUrl(this.contact().phone));
  protected readonly icons = IconName;
}
