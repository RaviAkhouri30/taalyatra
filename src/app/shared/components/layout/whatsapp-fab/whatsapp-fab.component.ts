import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { type IPhoneNumber } from '@shared/interfaces/i-contact-details';
import { toWhatsAppUrl } from '@shared/utils/contact-links.util';

/** Floating WhatsApp button on inner pages; hidden on phones, where the action bar has it. */
@Component({
  selector: 'app-whatsapp-fab',
  imports: [IconComponent],
  templateUrl: './whatsapp-fab.component.html',
  styleUrl: './whatsapp-fab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsAppFabComponent {
  public readonly phone = input.required<IPhoneNumber>();

  protected readonly url = computed(() => toWhatsAppUrl(this.phone()));
  protected readonly icon = IconName.WhatsApp;
}
