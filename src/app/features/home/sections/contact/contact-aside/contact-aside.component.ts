import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { type IContactAside } from '../contact.model';

/** "Prefer to talk?" — WhatsApp, call and email rows plus a note for short-notice events. */
@Component({
  selector: 'app-contact-aside',
  imports: [IconComponent],
  templateUrl: './contact-aside.component.html',
  styleUrl: './contact-aside.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactAsideComponent {
  public readonly aside = input.required<IContactAside>();
}
