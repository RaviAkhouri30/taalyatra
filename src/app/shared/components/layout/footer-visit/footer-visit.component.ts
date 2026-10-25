import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type IContactDetails } from '@shared/interfaces/i-contact-details';
import { toMailtoHref, toTelHref } from '@shared/utils/contact-links.util';

/** "Visit us" footer column: map card, business details and a directions link (home page). */
@Component({
  selector: 'app-footer-visit',
  templateUrl: './footer-visit.component.html',
  styleUrl: './footer-visit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterVisitComponent {
  public readonly contact = input.required<IContactDetails>();

  protected readonly telHref = computed(() => toTelHref(this.contact().phone));
  protected readonly mailHref = computed(() => toMailtoHref(this.contact().email));
  protected readonly mapLabel = computed(
    () => `Open ${this.contact().businessName} in Google Maps`,
  );
}
