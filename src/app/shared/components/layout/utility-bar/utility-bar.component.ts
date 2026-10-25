import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { AppRoute } from '@shared/enums/app-route.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { type IContactDetails } from '@shared/interfaces/i-contact-details';
import { type ISocialLink } from '@shared/interfaces/i-social-link';
import { toMailtoHref, toTelHref } from '@shared/utils/contact-links.util';

/** Thin bar above the header: phone, email, location, social profiles and the admin login. */
@Component({
  selector: 'app-utility-bar',
  imports: [IconComponent, RouterLink],
  templateUrl: './utility-bar.component.html',
  styleUrl: './utility-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UtilityBarComponent {
  public readonly contact = input.required<IContactDetails>();
  public readonly socials = input.required<readonly ISocialLink[]>();

  protected readonly telHref = computed(() => toTelHref(this.contact().phone));
  protected readonly mailHref = computed(() => toMailtoHref(this.contact().email));
  protected readonly icons = IconName;
  protected readonly adminRoute = AppRoute.Admin;
}
